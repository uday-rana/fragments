# POST a text/csv fragment

POST http://localhost:8080/v1/fragments
Content-Type: text/csv
[BasicAuth]
user1@email.com:password1
```
this,is,csv
```

HTTP/1.1 201
[Asserts]
[Captures]
url: header "Location"

# GET it back as JSON

GET {{url}}.json
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
Content-Length: 21
[["this","is","csv"]]
