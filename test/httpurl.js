function isUrl(s) {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!urlPattern.test(s);
}
  
  console.log(isUrl("http://www.example.com")); // true
  console.log(isUrl("http://127.0.0.1:11434/")); //true
  console.log(isUrl("http://localhost:11434/")); //true
  console.log(isUrl("")); //false
  