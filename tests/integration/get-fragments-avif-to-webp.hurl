POST http://localhost:8080/v1/fragments
Content-Type: image/avif
[BasicAuth]
user1@email.com:password1
file,images/cute-kitten.avif;

HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "image/avif"
jsonpath "$.fragment.size" == 5855
[Captures]
url: header "Location"

GET {{url}}.webp
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/webp
Content-Length: 10088
file,images/cute-kitten.webp;
