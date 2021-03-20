function kmp(source, pattern) {
    //计算table
    // table中每一位存储着当前位之前最长子串重复的次数（同时也是重复字符串的结尾的索引）
    let table = new Array(pattern.length).fill(0);

    {
        //i从第2位开始，代表当前遍历到的位置
        //j指向比较的字符的位置，从0开始
        let i = 1,
            j = 0;

        while (i < pattern.length) {
            //1 0  相等，i=2,j=1,table[2] = 1
            //2 1  不相等，j>0, j = 0
            //2 0  不相等，j===0, i++ => 3
            //3 0  相等，i=4,j=1,table[4] = 1
            //4 1  相等，i=5,j=2,table[5]=2
            //5 2  不相等，j = 2 > 0 => j = table[2] = 1（这一步是找到断开的字符串的上一个的位置）
            //5 1 相等，i=6,j=2 table[6] =2
            //6 2 不相等 j>0 j=table[2]=1
            //6 1 不相等 j>0 j = table[1]=0
            //6 0 不相等 j===0 i++ => 7 结束循环
            if (pattern[i] === pattern[j]) {
                //相等则存储前面重复出现的次数
                ++i, ++j;
                table[i] = j; //
            } else {
                //一旦不连续重复（j>0即表示连续被断开），需要找到连续的最后一个数的索引，判断前一段是否重复（比如「aaa」和「aab」不重复了，但是aa和aa还是重复的）
                if (j > 0) {
                    j = table[j];
                } else {
                    //一直未出现重复，则直接判断下一个字符
                    ++i;
                }
            }
        }
        // console.log(table);
    }

    {
        let i = 0,
            j = 0;
        while (i < source.length) {

            if (pattern[j] === source[i]) {
                ++i, ++j;
            } else {
                if (j > 0) {
                    j = table[j];
                } else {
                    ++i;
                }
            }
            //匹配的子串和源串完全相同
            if(j === pattern.length) return true;
        }
        return false;//源串遍历完了，表示没有匹配上
    }
}
let bol = kmp("aabaabcab", "abc");
console.log(bol);