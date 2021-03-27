function kmp(source, pattern) {
    //计算table
    // table中每一位存储着当前位之前子串重复的次数（同时也是重复字符串的结尾的索引）
    let table = new Array(pattern.length).fill(0);

    {
        //i从第2位开始，代表当前遍历到的位置
        //j指向比较的字符的位置，从0开始
        let i = 1,
            j = 0;

        while (i < pattern.length) {
            if (pattern[i] === pattern[j]) {
                //相等则存储前面重复字符的结束索引
                //一旦不连续（也就是i和j指向的字符从相等变成不相等了），可以通过j找到重复字符串的最后一个字符
                ++i, ++j;
                table[i] = j; 
            } else {
                //一旦不连续重复（j>0即表示连续被断开），需要找到连续的最后一个字符的索引，当前字符和连续的最后一个字符是否相同，也就是是否有重复字符出现，比如「aaa」和「aab」不重复了，需要把j从b的索引，变为前一个a的索引，比较aaa的第三位a和aab的第二位a是否相等，如果相等，说明有子串重复）
                if (j > 0) {
                    //在j没有赋值为0之前，会从重复字符串的结尾开始依次赋值为上个重复字符的索引位置，判断和当前i位置字符是否相等，直到j赋值为0
                    //这个过程中，只要子串中有一个字符和当前字符相同，就可以认为重复一次
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