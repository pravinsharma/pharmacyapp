const pug = require('pug');
const http = require('http');
const qs = require('querystring');
const crypto = require("crypto");

var json = {'data' : []};
http.createServer(function (req, res) {
    if (req.url == '/action_add') {
        
        req.on('data', chunk => {
            const data = qs.parse(chunk.toString());
            const id = crypto.randomBytes(16).toString("hex");
            
            data.id = id;
            json.data.push( data );
            console.log('A chunk of data has arrived: ', json);

            viewpage(res, './templates/editmedicine.pug');
        });
        req.on('end', () => {
            console.log('No more data');
        });
    } else if (req.url == '/action_edit') {
        console.log('action: edit...');
        
        req.on('data', chunk => {
            const data = qs.parse(chunk.toString());
            
            console.log('A chunk of data has arrived: ', data);

            removejson(data.medicineid);
            json.data.push( data );
            
            viewpage(res, './templates/editmedicine.pug');
        });
        req.on('end', () => {
            console.log('No more data');
        });
    } else if (req.url == '/action_delete') {
        console.log('delete...');

        req.on('data', chunk => {
            const data = qs.parse(chunk.toString());
            
            console.log('A chunk of data has arrived: ', data.medicineid);

            for(var i=0; i<data.medicineid.length; i++) {
                removejson(data.medicineid[i]);
            }

            viewpage(res, './templates/deletemedicine.pug');
        });
        req.on('end', () => {
            console.log('No more data');
        });
    } else if (req.url == '/viewmedicine' || req.url == '/deletemedicine' || req.url == '/editmedicine') {
        console.log(req.url + '...');

        viewpage(res, './templates' + req.url + '.pug');
    } else {

        // Compile a function
        const html = pug.compileFile('./templates/addmedicine.pug');

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(html());
        res.end();
    }
}).listen(8080);

function removejson(medicineid) {

    //iterate and remove data
    for(var i=0; i<json.data.length; i++) {
        if(JSON.stringify(json.data[i]).indexOf(medicineid) != -1) {
            json.data.splice( i, 1 );
            break;
        }
    }
}

function viewpage(res, template) {

    // Compile a function
    const html = pug.compileFile(template);
    var jsonStr = JSON.stringify(json);
    console.log(jsonStr);

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write( html({jsonObj: json.data }) );
    res.end();
}