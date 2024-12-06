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

# Try to GET it back as CSV

GET {{url}}.csv
[BasicAuth]
user1@email.com:password1

HTTP/1.1 415
