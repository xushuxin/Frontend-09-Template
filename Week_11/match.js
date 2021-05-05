// 仅考虑了type class id选择器的匹配
function match(selector, element) {
    let dealedSelectors = [];
    let token = {};
    let curEl = element;
    let correctCnt = 0;
    function findStart(c){
        if(c === '#'){
            token = {
                type:'id',
                name:''
            }
            if(Array.isArray(dealedSelectors[dealedSelectors.length-1])){
                dealedSelectors[dealedSelectors.length-1].push(token);
            }else{
                dealedSelectors.push(token);
            };
            return findId;

        }else if(c === '.'){
        
            token = {
                type:'class',
                name:''
            }
            if(Array.isArray(dealedSelectors[dealedSelectors.length-1])){
                dealedSelectors[dealedSelectors.length-1].push(token);
            }else{
                dealedSelectors.push(token);
            }
        
            return findClass
        }else if(/[a-z]/.test(c)){
            token = {
                type:'type',
                name:''
            }
            dealedSelectors.push(token);
            return findType(c)
        }else if(/\s+/.test(c)){//空格
            dealedSelectors.push([])
            return findStart
        }
    }

    function findId(c){
        if(/[a-z]/.test(c)){
            token.name += c;
            return findId;
        }else{
            console.log(c)
            token = {};
            return findStart(c);
        }
    }
    function findClass(c){
        if(/[a-z]/.test(c)){
            token.name += c;
            return findClass;
        }else{
            token = {};
            return findStart(c);
        }
    }
    function findType(c){
        if(/[a-z]/.test(c)){
            token.name += c;
            return findType;
        }else{
            token = {};
            return findStart(c);
        }
    }
    var state = findStart
    for(let i= 0;i<selector.length;i++){
        state = state(selector[i]);
    }

    console.log(dealedSelectors)
    dealedSelectors.reverse();
    matchSelector(dealedSelectors);

    function matchSelector(dealedSelectors,len = 1){
    
        for(let s of dealedSelectors){
            if(Array.isArray(s)){
                matchSelector(s,s.length);
            }else{
                if(
                    (s.type === 'type' && curEl.tagName.toLowerCase() === s.name )||
                    (s.type === 'class' && curEl.className === s.name) ||
                    (s.type === 'id' && curEl.id === s.name)
                ){
                    correctCnt ++;
                }
                len --;
                len === 0 && (curEl = curEl.parentElement);
            }
        }
    }
    return correctCnt === dealedSelectors.flat().length;//匹配次数等于选择器的个数
}



match("div #myid.myclass", document.getElementById("myid"));