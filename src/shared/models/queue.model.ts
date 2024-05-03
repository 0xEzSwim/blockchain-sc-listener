import { Subject } from "rxjs";

export class Queue<T> {
    private items: Record<number, T>;
    private head: number;
    private tail: number;
    private queueSubject$?: Subject<Queue<T>>;

    constructor(queueSubject$?: Subject<Queue<T>>) {
        this.items = {};
        this.head = 0;
        this.tail = 0;
        this.queueSubject$ = queueSubject$;
    }

    enqueue(item: any) {
        this.items[this.tail] = item;
        this.tail++;

        if(!this.queueSubject$) {
            return;
        }
        this.queueSubject$.next(this);
    }

    dequeue(): T | undefined {
        if(this.isEmpty()){
            return;
        }

        const firstItem: any = this.peek();
        delete this.items[this.head];
        this.head++;

        if(!this.queueSubject$) {
            return firstItem;
        }
        this.queueSubject$.next(this);

        return firstItem;
    }

    peek(): T {
        return this.items[this.head];
    }

    size(): number {
        return this.tail - this.head;
    }

    isEmpty(): boolean {
        return this.size() ? false : true;
    }

    clear() {
        this.items = {};
        this.head = 0;
        this.tail = 0;
    }
}