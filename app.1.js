const fs = require("fs");
const axios = require("axios");
var result = []
var length = 0
var arrayCount = 3
var allArray = []

axios.get("http://www.daomubiji.org/dao-mu-bi-ji-chong-qi")
    .then(res => {
        let array = getCatalogs(res.data);
        length= array.length
        getCatalogsContent(array)
    })
    .catch(e => {
        console.log("error");
        console.log(e.response);
    });

function getCatalogsContent(array) {
    var gets = []
    var array1 = []
    var array2 = []
    var array3 = []
    allArray = [array1, array2, array3]

    array.forEach((catalog, index) => {
        if ((index + 1) % 3 === 1) {
            allArray[0].push(catalog);
        } else if ((index + 1) % 3 === 2) {
            allArray[1].push(catalog);
        } else {
            allArray[2].push(catalog);
        }
    })
   
    getPartCatalogsCOntent(allArray[0],0)
}

function getPartCatalogsCOntent(array,index) {
    let count = 0;
    array.forEach(catalog => {
        console.log('获取章节内容:' + catalog.index + ' ' + catalog.title);
        getCatalogContent(catalog, function (html) {
            catalog.content = html
            result.push(catalog);
            count++;
            console.log(result.length);
            if(count === array.length) {
                if(index + 1 < arrayCount) {
                    getPartCatalogsCOntent(allArray[index + 1],index +1)
                }
                else {
                    if (result.length === length) {
                        writeDataToFile('盗墓笔记重启.txt', result)
                    }
                }
            }
        })
    })
}


function writeDataToFile(fileName, data) {
    data = data.sort((a, b) => {
        return a.index - b.index
    })

    data.forEach(element => {
        fs.appendFileSync(__dirname + '/' + fileName, element.title + '\r\n' + element.content);
    })
}

function getCatalogContent(catalog, func) {
    let html = ''
    axios({
        url:catalog.url,
        timeout:15000
    }).then(res => {
            html = getHtmlByRegex(res.data)
            console.log('成功:' + catalog.title);
            func(html)
        }).catch(e => {
            console.log('失败:' + catalog.title);
            console.log(e)
            func(html)
        })
}

function getHtmlByRegex(html) {
    let reg = /<!-- top-left-ad-only -->[.\s\S]+<p class=\"weixin\">/g
    html = html.match(reg)[0]
    html = html.replace(/<\/p>/g, '\r\n')
    html = html.replace(/<.*?>/g, '')
    return html
}


function getCatalogs(html) {
    try {
        let catalogs = [];
        let reg = /<li><span><a.*?<\/a><\/span><\/li>/g;
        let reg2 = /<li><span><a.*?href=\"(.*?)\".*?>(.*?)<\/a><\/span><\/li>/g;
        let arr = html.match(reg);
        if (!arr || !arr.length) {
            console.log("没有匹配到数据");
            return;
        }
        arr.forEach((element, index) => {
            let reg2 = /<li><span><a.*?href=\"(.*?)\".*?>(.*?)<\/a><\/span><\/li>/g;
            reg2.test(element);
            catalogs.push({
                index: index,
                url: RegExp.$1,
                title: RegExp.$2
            });
        });
        return catalogs;
    } catch (error) {
        console.log("getCatalogs:" + error);
    }
}

// setInterval(() => {
//     console.log('node正在执行');
// }, 1000000)