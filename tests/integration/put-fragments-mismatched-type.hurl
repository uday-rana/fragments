# POST a fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

# GET it's location
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
[Captures]
url: header "Location"

# Try to PUT new data of a different content type in
PUT {{url}}
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`This is the same fragment!`

HTTP/1.1 400
[Asserts]
jsonpath "$.status" == "error"
