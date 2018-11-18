const pug = require('pug');
const qs = require('querystring');
const crypto = require("crypto");
var express = require('express')
var app = express()


/* ---------VIEW ROUTER--------- */

// all views
app.get('/*', function (req, res) {
    myapp.log(req.url + '...');

    if (req.url == '/viewmedicine' || req.url == '/deletemedicine' || req.url == '/editmedicine') {

        myapp.util.page.view(res, './templates' + req.url + '.pug');
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
    myapp.log('action: add...');
        
    req.on('data', chunk => {
        const data = qs.parse(chunk.toString());
        const id = crypto.randomBytes(16).toString("hex");
        
        data.id = id;
        myapp.json.data.push( data );
        myapp.log('A chunk of data has arrived: ', myapp.json.data);

        myapp.util.page.view(res, './templates/viewmedicine.pug');
    });
    req.on('end', () => {
        myapp.log('No more data');
    });
});

// modification of medicine
app.post('/action_edit', function (req, res) {
    myapp.log('action: edit...');
    
    req.on('data', chunk => {
        const data = qs.parse(chunk.toString());
        
        myapp.log('A chunk of data has arrived: ', data);

        myapp.util.json.remove(data.id);
        myapp.json.data.push( data );
        
        myapp.util.page.view(res, './templates/editmedicine.pug');
    });
    req.on('end', () => {
        myapp.log('No more data');
    });
});

// modification of medicine
app.post('/action_save', function (req, res) {
    myapp.log('action: save...');
    
    req.on('data', chunk => {
        const data = qs.parse(chunk.toString());
        
        myapp.log('A chunk of data has arrived: ', data);

        myapp.util.json.remove(data.id);
        myapp.json.data.push( data );

        myapp.log('view data: ', myapp.json.data);
        
        myapp.util.page.view(res, './templates/viewmedicine.pug');
    });
    req.on('end', () => {
        myapp.log('No more data');
    });
});

// deletion of medicines
app.post('/action_delete', function (req, res) {
    myapp.log('delete...');

    req.on('data', chunk => {
        const data = qs.parse(chunk.toString());
        
        myapp.log('A chunk of data has arrived: ', data.id);

        if( data.id instanceof Array) {
            for(var i=0; i<data.id.length; i++) {
                myapp.util.json.remove(data.id[i]);
            }
        } else {
            myapp.util.json.remove(data.id);
        }

        myapp.util.page.view(res, './templates/deletemedicine.pug');
    });
    req.on('end', () => {
        myapp.log('No more data');
    });
});

// redirect to page
app.post('/action_redirect', function (req, res) {
    myapp.log('redirect...');

    req.on('data', chunk => {
        const data = qs.parse(chunk.toString());
        
        myapp.log('A chunk of data has arrived: ', data.id);

        if( data.id ) {
            myapp.util.page.view(res, './templates/editsolemedicine.pug', data.id);
        }
    });
    req.on('end', () => {
        myapp.log('No more data');
    });
});

app.listen(8080);


/* ---------GLOBAL VARS/UTILITIES--------- */

var myapp = {
    "switch": {      // add capability switches
        "log":  true,
        "debug": true
    },
    "log": function() {      // console log capability
        for (var i = 0; i < arguments.length; i++) {
            if( myapp.switch.log ) {
                console.log(arguments[i]);
            }
        }
    },
    "debug": function() {      // console debug capability
        for (var i = 0; i < arguments.length; i++) {
            if( myapp.switch.debug ) {
                console.debug(arguments[i]);
            }
        }
    }
};

// create json data
myapp.json = { "data": [] };

// json utils
myapp.util = {
    "json": {
        "remove": function(medicineid) {        // remove json by id

            //iterate and remove data
            for(var i=0; i<myapp.json.data.length; i++) {
                if(JSON.stringify(myapp.json.data[i]).indexOf(medicineid) != -1) {
                    myapp.json.data.splice( i, 1 );
                    break;
                }
            }
        },
        "getindex": function(medicineid) {      // get json by index given medicineid

            //iterate and get data index
            for(var i=0; i<myapp.json.data.length; i++) {
                if(JSON.stringify(myapp.json.data[i]).indexOf(medicineid) != -1) {
                    return i;
                }
            }

            return -1;
        }
    },
    "page": {
        "view": function(res, template, id) {       //render page view
            myapp.log('view...');

            // Compile a function
            const html = pug.compileFile(template);
            var jsonStr = JSON.stringify(myapp.json.data);
            console.log(jsonStr);

            res.writeHead(200, {'Content-Type': 'text/html'});
            
            if( id ) {
                var _inx = myapp.util.json.getindex(id);
                myapp.log(_inx, myapp.json.data[ _inx ]);
                res.write( html({jsonObj: [ myapp.json.data[ _inx ] ] }) );
            } else {
                res.write( html({jsonObj: myapp.json.data }) );
            }

            res.end();
        }
    }
};