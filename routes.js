// const fs = require("fs");
// // console.log(req.url , req.method , req.headers )
// // data from the request
// const handleRequests = (req, res) => {
//   const url = req.url;
//   const method = req.method;

//   if (url === "/") {
//     res.setHeader("Content-Type", "text/html");

//     res.write("<html>");
//     res.write("<head><title>My First Page</title></head>");
//     res.write(
//       '<body><form action="/message" method="POST"><input name="message" type="text"/><button>Send</button></form></body>'
//     );
//     res.write("</html>");

//     // Send The Respond return is used to stop the function
//     return res.end();
//   }

//   if (url === "/message" && method === "POST") {
//     const body = [];

//     // Whenever a chunck of data comes
//     req.on("data", (chunk) => {
//       console.log(chunk);
//       body.push(chunk);
//     });
//     // data ends
//     return req.on("end", () => {
//       const parsedBody = Buffer.concat(body).toString();
//       const message = parsedBody.split("=")[1];
//       fs.writeFile("message.txt", message, (err) => {
//         // The output is message=input
//         // console.log(parsedBody);
//         // res.writeHead(302,{})
//         res.statusCode = 302;
//         // The page to redirect after request
//         res.setHeader("Location", "/");
//         return res.end();
//       });
//     });
//   }
//   // Editting the response
//   res.setHeader("Content-Type", "text/html");

//   res.write("<html>");
//   res.write("<head><title>My First Page</title></head>");
//   res.write("<body><h1>Hello From my Node.js</h1></body>");
//   res.write("</html>");

//   // Send The Respond
//   res.end();
// };

// module.exports = handleRequests;
