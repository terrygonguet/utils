export class Task<T, E extends Error = Error> {
	_state:
		| { type: "pending"; promise: Promise<void> }
		| { type: "failed"; error: E }
		| { type: "complete"; value: T }

	private constructor(
		state:
			| Exclude<Task<T, E>["_state"], { type: "pending" }>
			| { type: "pending"; promise: Promise<T> },
	) {
		if (state.type == "pending") {
			const promise = state.promise.then(
				value => {
					this._state = { type: "complete", value }
				},
				error => {
					this._state = { type: "failed", error }
				},
			)
			this._state = { type: "pending", promise }
		} else this._state = state
	}

	*[Symbol.iterator](): Iterator<Task<T, E>, T> {
		yield this
		if (this._state.type == "complete") return this._state.value
		else if (this._state.type == "pending")
			throw new Error("Tried to unwrap a pending Task via its iterator")
		else throw new Error("Tried to unwrap a failed Task via its iterator")
	}

	static async do<T, E extends Error>(
		f: () => Iterator<Task<any, E>, T, any>,
	): Promise<Task<T, E>> {
		const gen = f()
		let iter = gen.next()
		while (!iter.done) {
			const task = iter.value
			switch (task._state.type) {
				case "complete":
					iter = gen.next(task._state.value)
					break
				case "pending":
					await task._state.promise
					const resolved = task as Task<any> // rebind so TS "forgets" about the type narrowing
					if (resolved._state.type == "complete")
						iter = gen.next(resolved._state.value)
					else if (resolved._state.type == "failed") {
						gen.return?.(undefined)
						return resolved
					} else throw new Error("Task is in an invalid state")
					break
				case "failed":
					gen.return?.(undefined)
					return task
			}
		}
		return Task.from(iter.value)
	}

	static complete<T, E extends Error = Error>(value: T): Task<T, E> {
		return new Task({ type: "complete", value })
	}

	static failed<T, E extends Error = Error>(error: E): Task<T, E> {
		return new Task({ type: "failed", error })
	}

	static fromPromise<T, E extends Error = Error>(
		promise: Promise<T>,
	): Task<T, E> {
		return new Task({ type: "pending", promise })
	}

	static from<T, E extends Error = Error>(
		thing: T | E | Promise<T> | Task<T, E>,
	): Task<T, E> {
		if (thing instanceof Promise) return Task.fromPromise(thing)
		else if (thing instanceof Error) return Task.failed(thing)
		else if (thing instanceof Task) return thing
		else return Task.complete(thing)
	}

	static wrapFunction<Args extends any[], T, E extends Error = Error>(
		f: (...args: Args) => T | Promise<T>,
	): (...args: Args) => Task<T, E> {
		return (...args: Args) => {
			try {
				return Task.from<T, E>(f(...args))
			} catch (error) {
				if (error instanceof Error) return Task.failed(error as E)
				else
					return Task.failed<T, E>(
						new Error("Wrapped", { cause: error }) as E,
					)
			}
		}
	}

	static isTask<T, E extends Error = Error>(
		maybeTask: unknown,
	): maybeTask is Task<T, E> {
		return maybeTask instanceof Task
	}

	[Symbol.toPrimitive]() {
		return this.toString()
	}

	isPending(): boolean {
		return this._state.type == "pending"
	}

	isComplete(): boolean {
		return this._state.type == "complete"
	}

	isFailed(): boolean {
		return this._state.type == "failed"
	}

	then<U>(
		onResolve: (value: T) => U | Promise<U>,
		onReject: (error: E) => U | Promise<U>,
	): U | Promise<U> {
		if (this._state.type == "complete") return onResolve(this._state.value)
		else if (this._state.type == "pending") {
			return this._state.promise.then(() => {
				if (this._state.type == "complete")
					return onResolve(this._state.value)
				else if (this._state.type == "failed")
					return onReject(this._state.error)
				else
					return onReject(
						new Error("Task is in an invalid state") as E,
					)
			})
		} else return onReject(this._state.error)
	}

	map<U, E2 extends E>(f: (value: T) => U | Promise<U>): Task<U, E2> {
		if (this._state.type == "pending") {
			return Task.fromPromise<U, E2>(
				this._state.promise.then(() => this.map(f) as PromiseLike<U>),
			)
		} else if (this._state.type == "complete") {
			try {
				const result = f(this._state.value)
				if (result instanceof Promise) return Task.fromPromise(result)
				else return Task.complete(result)
			} catch (error) {
				return Task.failed(error as E2)
			}
		} else return this as any
	}

	flatMap<U, E2 extends E>(f: (value: T) => Task<U, E2>): Task<U, E2> {
		if (this._state.type == "pending") {
			return Task.fromPromise<U, E2>(
				this._state.promise.then(
					() => this.flatMap(f) as PromiseLike<U>,
				),
			)
		} else if (this._state.type == "complete") return f(this._state.value)
		else return this as any
	}

	flatten(): T extends Task<infer U> ? Task<U> : Task<T>
	flatten(): Task<any> {
		if (this._state.type == "complete")
			return Task.isTask(this._state.value) ? this._state.value : this
		else if (this._state.type == "failed") return this
		else
			return Task.fromPromise(
				this._state.promise.then(() => this.flatten()),
			)
	}

	orDefault(defaultValue: T): Promise<T> {
		if (this._state.type == "complete")
			return Promise.resolve(this._state.value)
		else if (this._state.type == "failed")
			return Promise.resolve(defaultValue)
		else
			return this._state.promise.then(() => {
				if (this._state.type == "complete") return this._state.value
				else return defaultValue
			})
	}

	unwrap(): T {
		if (this._state.type == "complete") return this._state.value
		else if (this._state.type == "failed")
			throw new Error("Tried to unwrap a failed Task")
		else throw new Error("Tried to unwrap a pending Task")
	}

	toString() {
		if (this._state.type == "failed")
			return `Task(Failed: ${this._state.error.message})`
		else if (this._state.type == "pending") return "Task(Pending)"
		switch (typeof this._state.value) {
			case "string":
				return `Task(Complete: "${this._state.value}")`
			case "function":
			case "object":
				return `Task(Complete: ${JSON.stringify(this._state.value)})`
			default:
				return `Task(Complete: ${this._state.value})`
		}
	}
}
