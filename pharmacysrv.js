const pug = require('pug');
const http = require('http');
const qs = require('querystring');
const crypto = require("crypto");

var json = {'data' : []};
http.createServer(function (req, res) {
    if (req.url == '/addmedicine') {
        
        req.on('data', chunk => {
            const data = qs.parse(chunk.toString());
            const id = crypto.randomBytes(16).toString("hex");
            
            data.id = id;
            json.data.push( data );
            console.log('A chunk of data has arrived: ', json);

            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write("Saved.");
            res.end();
        });
        req.on('end', () => {
            console.log('No more data');
        });
    } else if (req.url == '/action_edit') {
        console.log('action: edit...');
        
        req.on('data', chunk => {
            const data = qs.parse(chunk.toString());
            
            console.log('A chunk of data has arrived: ', data);

            json.data.splice( json.data.indexOf(data.medicineid), 1 );
            json.data.push( data );

            editmedicine(res);
        });
        req.on('end', () => {
            console.log('No more data');
        });
    } else if (req.url == '/viewmedicine') {

        viewmedicine(res);
    } else if (req.url == '/deletemedicine') {
        console.log('delete...');

        req.on('data', chunk => {
            const data = qs.parse(chunk.toString());
            
            console.log('A chunk of data has arrived: ', data.medicineid);

            json.data.splice( json.data.indexOf(data.medicineid), 1 );

            viewmedicine(res);
        });
        req.on('end', () => {
            console.log('No more data');
        });
    } else if (req.url == '/editmedicine') {
        console.log('edit...');

        editmedicine(res);
    } else {

        // Compile a function
        const html = pug.compileFile('./templates/addmedicine.pug');

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(html());
        res.end();
    }
}).listen(8080);

function viewmedicine(res) {

    // Compile a function
    const html = pug.compileFile('./templates/viewmedicine.pug');
    var jsonStr = JSON.stringify(json);
    console.log(jsonStr);

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write( html({jsonObj: json.data }) );
    res.end();
}

function editmedicine(res) {

    // Compile a function
    const html = pug.compileFile('./templates/editmedicine.pug');
    var jsonStr = JSON.stringify(json);
    console.log(jsonStr);

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write( html({jsonObj: json.data }) );
    res.end();
}