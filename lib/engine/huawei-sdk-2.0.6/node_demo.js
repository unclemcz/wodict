var signer = require('./signer');
var https = require("https");
var sig = new signer.Signer();
//Set the AK/SK to sign and authenticate the request.
// 认证用的ak和sk硬编码到代码中或者明文存储都有很大的安全风险，建议在配置文件或者环境变量中密文存放，使用时解密，确保安全；
// 本示例以ak和sk保存在环境变量中为例，运行本示例前请先在本地环境中设置环境变量HUAWEICLOUD_SDK_AK和HUAWEICLOUD_SDK_SK。
sig.Key = process.env.HUAWEICLOUD_SDK_AK;
sig.Secret = process.env.HUAWEICLOUD_SDK_SK;

//The following example shows how to set the request URL and parameters to query a VPC list.
//Specify a request method, such as GET, PUT, POST, DELETE, HEAD, and PATCH.
//Set request host.
//Set request URI.
//Set parameters for the request URL.
var r = new signer.HttpRequest("GET", "endpoint.example.com/v1/77b6a44cba5143ab91d13ab9a8ff44fd/vpcs?limie=1");
//Add header parameters, for example, x-domain-id for invoking a global service and x-project-id for invoking a project-level service.
r.headers = {"Content-Type": "application/json"};
//Add a body if you have specified the PUT or POST method. Special characters, such as the double quotation mark ("), contained in the body must be escaped.
r.body = '';

var opt = sig.Sign(r);
console.log(opt.headers["X-Sdk-Date"]);
console.log(opt.headers["Authorization"]);

var req = https.request(opt, function (res) {
    console.log(res.statusCode);
    console.log('headers:', JSON.stringify(res.headers));
    res.on("data", function (chunk) {
        console.log(chunk.toString())
    })
});

req.on("error", function (err) {
    console.log(err.message)
});
req.write(r.body);
req.end();
