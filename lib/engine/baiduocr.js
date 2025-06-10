const axios = require('axios');

async function ocr(imgbase64,engine) {
    let AK = engine.ak;
    let SK = engine.sk;
    let resulttext = '';
    if (AK == '' || AK == null || AK == undefined) {
        resulttext = '请配置百度OCR AK';
        return resulttext;
    } else if(SK == '' || SK == null || SK == undefined) {
        resulttext = '请配置百度OCR SK';
        return resulttext;
    }
    var options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=' + await getAccessToken(AK,SK),
        'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
        },
        data: {
                'image': imgbase64,
                'detect_direction': 'false',
                'detect_language': 'true',
                'paragraph': 'false',
                'probability': 'false'
        }
    };

    return axios(options)
        .then(response => {
            //console.log("ocr()",response.data);
            resulttext = response.data.words_result.map(item => item.words).join(' ');
            return  resulttext;
        })
        .catch(error => {
            throw new Error(error);
        })
}

/**
 * 使用 AK，SK 生成鉴权签名（Access Token）
 * @return string 鉴权签名信息（Access Token）
 */
function getAccessToken(AK,SK) {

    let options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK,
    }
    return new Promise((resolve, reject) => {
      axios(options)
          .then(res => {
              //console.log("getAccessToken()",res.data);
              if(res.data.access_token){
                resolve(res.data.access_token)
              }else{
                resolve(res.data.error)
              }
          })
          .catch(error => {
              reject(error)
          })
    })
}


exports.ocr = ocr;
