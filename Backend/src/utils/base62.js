const ALPH = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function generate(len = 6){
    let s = '';
    for(let i = 0; i < len; i++){
        s += ALPH[Math.floor(Math.random() * ALPH.length)];
        return s;
    }
}

export default generate;