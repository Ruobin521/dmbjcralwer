const fs = require("fs");
const axios = require("axios");
var result = []
var fileName = '盗墓笔记重启2.txt'

axios.get("http://www.daomubiji.org/dao-mu-bi-ji-chong-qi")
    .then(res => {
        let array = getCatalogs(res.data);
        getCatalogsContent(array)
    })
    .catch(e => {
        console.log("error");
        console.log(e.response);
    });

function getCatalogsContent(array) {
    array.forEach(catalog => {
        console.log('获取章节内容:' + catalog.index + ' ' + catalog.title);
        getCatalogContent(catalog, function (html) {
            catalog.content = html
            result.push(catalog);
            console.log(result.length);
            if (result.length === array.length) {
                writeDataToFile(fileName, result)
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
        url: catalog.url,
        timeout: 15000
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