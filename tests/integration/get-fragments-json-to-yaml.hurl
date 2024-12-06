# POST an application/json fragment

POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{"this":{"value":"is json"},"that":["is","yaml"]}

HTTP/1.1 201
[Asserts]
[Captures]
url: header "Location"

# GET it back as YAML

GET {{url}}.yaml
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/yaml; charset=utf-8
Content-Length: 45
```
this:
  value: is json
that:
  - is
  - yaml
```
