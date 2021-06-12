async function a(){
    let b = 2
    for(let i = 0; i< 3;i++){
        if(b === 2){
            let res = await c();
            console.log(res);
        }
    }
}

function c(){
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve('666');
        },2000)
    })
    
}
a()