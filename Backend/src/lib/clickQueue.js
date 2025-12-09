// Simple in-memory queue used for local dev. Replace with BULL/Redis streams/SQS in prod

const events = [];
let running = false;

function push(ev) {
    events.push(ev);
    if(!running) {
        processQueue();
    }
}

async function processQueue() {
    running = true;
    while(events.length) {
        const e = events.shift();
        // native processing : write to console. In production, persist to DB.
        console.log('Processing click event', e.slug, e.at);
        //simulate async work
        await new Promise(r => {
            setTimeout(r, 10)
        });
    }
    running = false;
}

export default push;