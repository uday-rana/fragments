# POST a text/markdown fragment

POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
```
# this is markdown
```

HTTP/1.1 201
[Asserts]
[Captures]
url: header "Location"

# GET it back as HTML

GET {{url}}.html
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/html; charset=utf-8
Content-Length: 26
```
<h1>this is markdown</h1>
```
