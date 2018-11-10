const pug = require('pug');
const http = require('http');
const qs = require('querystring');
const crypto = require("crypto");
var express = require('express')
var app = express()


/* ---------VIEW ROUTER--------- */

// all views
app.get('/*', function (req, res) {
    console.log(req.url + '...');

    if (req.url == '/viewmedicine' || req.url == '/deletemedicine' || req.url == '/editmedicine') {

        myapp.viewpage(res, './templates' + req.url + '.pug');
    } else {

        // Compile a function
        const html = pug.compileFile('./templates/addmedicine.pug');

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(html());
        res.end();
    }
});

/* ---------ACTION ROUTER--------- */

// addition of medicine
app.post('/action_add', function (req, res) {
    console.log('action: add...');
        
    req.on('data', chunk => {
        const data = qs.parse(chunk.toString());
        const id = crypto.randomBytes(16).toString("hex");
        
        data.id = id;
        myapp.json.push( data );
        console.log('A chunk of data has arrived: ', myapp.json);

        myapp.viewpage(res, './templates/viewmedicine.pug');
    });
    req.on('end', () => {
        console.log('No more data');
    });
});

// modification of medicine
app.post('/action_edit', function (req, res) {
    console.log('action: edit...');
    
    req.on('data', chunk => {
        const data = qs.parse(chunk.toString());
        
        console.log('A chunk of data has arrived: ', data);

        myapp.removejson(data.medicineid);
        myapp.json.push( data );
        
        myapp.viewpage(res, './templates/editmedicine.pug');
    });
    req.on('end', () => {
        console.log('No more data');
    });
});

// deletion of medicines
app.post('/action_delete', function (req, res) {
    console.log('delete...');

    req.on('data', chunk => {
        const data = qs.parse(chunk.toString());
        
        console.log('A chunk of data has arrived: ', data.medicineid);

        if( data.medicineid instanceof Array) {
            for(var i=0; i<data.medicineid.length; i++) {
                myapp.removejson(data.medicineid[i]);
            }
        } else {
            myapp.removejson(data.medicineid[i]);
        }

        myapp.viewpage(res, './templates/deletemedicine.pug');
    });
    req.on('end', () => {
        console.log('No more data');
    });
});

app.listen(8080);


/* ---------GLOBAL VARS/UTILITIES--------- */

var myapp = {'json' : []};

// remove json by id
myapp.removejson = function(medicineid) {

    //iterate and remove data
    for(var i=0; i<myapp.json.length; i++) {
        if(JSON.stringify(myapp.json[i]).indexOf(medicineid) != -1) {
            myapp.json.splice( i, 1 );
            break;
        }
    }
}

// view page from template
myapp.viewpage = function(res, template) {

    // Compile a function
    const html = pug.compileFile(template);
    var jsonStr = JSON.stringify(myapp.json);
    console.log(jsonStr);

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write( html({jsonObj: myapp.json }) );
    res.end();
}