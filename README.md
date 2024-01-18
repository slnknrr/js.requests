# [requests](https://codeberg.org/slnknrr/js.requests)
- Node.js: `npm i @niknils/requests`
- Browser: `<script src="https://cdn.jsdelivr.net/npm/@niknils/requests"></script>`

[?`@niknils`](https://slnknrr.codeberg.page/whoami#alias:niknils)
# usage (browser, etc)
## example:
```JavaScript
req("https://captive.apple.com/", false).thenSync(200, (response)=>{
  console.log(`data`, response.text().data);
}).else(-0, ()=>{
  console.log(`CORS error {:`);
}).else((response)=>{ //-1 means any errors with internet (in review)
  console.log(`HTTP code`, response.code);
})
```

### synopsis:
```JavaScript
req(performAsync,requestMethod,requestURIs,requestHeaders,responseFormat,responseCode,onSuccess,onError)
```
## means:
**performAsync (`boolean := false`)**
- execution

**requestMethod (`string := 'GET'`)**
- `GET`
- another in developing

**requestHeaders (`?[]string, object := {}`)**
- `headers`; in review

**responseFormat (`?[]string := 'base'`)**
- `base` - base64 encoded data
- `json` - `JSON.parse`
- `text` - plaintext (no specific charset encoding; `as is`)
- `blob` - in developing; browser blob and buffer in Node.js
- `mime` - in developing; base64 `data:<MIME>;base64,<DATA>`

**responseCode (`?[]number?parseInt := 0`)**
- `Integer`: ==0 - no custum errors
- `Integer`: >=1 - HTTP response code
- `Integer`: <=0 - custum errors (-0 - CORS error, -1 - internal error; in review)

**onSuccess (`?[]function := []`)**
- execute if responseCode true (default CORS=-0 and internal errors>-0 -> onError)

**onError (`?[]function := []`)**
- execution functions if !=  onSuccess execution
