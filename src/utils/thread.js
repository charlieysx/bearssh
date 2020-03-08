let __id = 0;

export class Thread {
    constructor() {
        this.__id = __id++;
    }

    get id() {
        return this.__id;
    }

    async run(cb) {

    }
}

export class ThreadPool {
    constructor(count = 1) {
        this.count = count;
        this.threadList = [];
        this.runingList = [];
        this.running = false;
    }

    push(thread) {
        this.threadList.push(thread);
        this.run();
    }

    run() {
        if (this.runingList.length < this.count) {
            const first = this.threadList.pop();
            if (first) {
                this.runingList.push(first);
                first.run()
                    .then(res=> {})
                    .catch(err=> {})
                    .finally(()=> {
                        const index = this.runingList.findIndex(item=> item.id === first.id);
                        if (index !== -1) {
                            this.runingList.splice(index, 1);
                        }
                        this.run();
                    });
            }
        }
    }
}