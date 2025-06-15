const axios = require('axios');

const apiurl = 'http://localhost:5000/ocr'
async function ocr(imgbase64,engine) {
    /* curl调用方式
    curl -X POST http://localhost:5000/ocr \
        -H "Content-Type: application/json" \
        -d '{"image": "BASE64_ENCODED_IMAGE_DATA"}'
    */
    console.log('开始执行wxocr');
    let wxurl = engine?.url  || apiurl;
    //将imgbase64开头的"data:image/png;base64,"去除
    imgbase64 = imgbase64.replace("data:image/png;base64,", "");
    try {
        const response = await axios.post(wxurl, {
            image: imgbase64
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        //console.log('OCR response:', JSON.stringify(response.data.result.ocr_response));
        let result  = response.data.result.ocr_response;
        const resulttext = result
            .map(item => item.text || '')  // 确保text存在
            .join(' ');
        return resulttext;          


    } catch (error) {
        console.error('OCR request failed:', error);
        throw new Error(error);
    }
}

exports.ocr = ocr;
