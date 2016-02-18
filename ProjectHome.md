## What ##
_mjst_ is a lightweight, about 1Kb minified and gzipped, and performances focused template engine with standards support.
There are dozens JavaScript Template Engines solutions out there but as far as I know this is the only one based on validation for both client and server side programming languages.

## How ##
There is one single function to call:
```
// via text (e.g. Ajax or innerHTML from a template node)
var transformed = mjst('<?js var hello = "mjst!"; ?><js-hello/>');

// classic template node example
<script id="mytpl" type="text/html">
  <?js
    var hello = "mjst!";
  ?>
  <js-hello/>
</script>
myEl.innerHTML = mjst(document.getElementById("mytpl"));

// via XML (e.g. Ajax or a created document)
// this is a configuration object as second argument example as well
myEl.innerHTML = mjst(
  new DOMParser().parseFromString(
    '<root><js-hello/><br class="${myBrClass}" /></root>',
    "text/xml"
  ), {
    hello:"Hi there!",
    myBrClass:"clear-both"
  }
);

// Ajax example with an XML template as response
/*
<root>
  <ul>
    <?js
      for(var i = 0; i < collection.length; ++i) {
    ?>
      <li class="li-${i}">Item No: <js-i/> Name: <?js print(collection[i]); ?></li>
    <?js
      }
    ?>
  </ul>
</root>
*/

// transformation ...
myEl.innerHTML = mjst(xhr.responseXML, {collection:["a", "b", "c"]});
```
It is possible to write whatever we want inside an _mjst_ template block via `print(1, 2, 3, N, func(), whatever)` function, the only one injected in the execution scope.

## JavaScript block VS Attributes ##
To make _mjst_ templates XML compatible I decided to remove JavaScript block inside attributes. It is still possible to access JavaScript variables via `${myVar.propName}` as showed, as example, in the br node class.

## PHP And JavaScript Template Example ##
```
<?php // mjst example
function mjst($name, $value){
    echo '<?js var ', $name, '=', json_encode($value), ' ?>';
};
header('Content-Type: text/xml');
$a = array(
    'some database result' => array(1, 2, 3),
    'some other value' => 'Hi There'
);
?>
<?xml version="1.0"?>
<root>
    <?php mjst('result', $a); ?>
    <?js
    for(var k in result)
        print(result[k], "<br />")
    ;
    ?>
</root>

<script type="text/javascript" src="mjst.js"></script>
<script type="text/javascript">
onload = function(){
    with(this.XMLHttpRequest ?
      new XMLHttpRequest :
      new ActiveXObject("Microsoft.MSXML")
    ){
      open("get", "mjst.php", true);
      onreadystatechange = function(){
        if(readyState == 4)
          document.body.innerHTML = mjst(responseXML);
        ;
      };
      send(null);
    };
};
</script>
```

## Why Standards ##
Apparently every other JavaScript template engine is implementing a manual, char by char, or RegExp based, parser, over a syntax that in PHP world has basically defined deprecated ages ago: the classic `<%=stuff%>` (<?=stuff?> in PHP).
The first reason to avoid this kind of syntax is **ambiguity**.
Which program language should consider that block of code? PHP, ASP, JavaScript ... who else? Moreover, to make things as clear and simple as possible, avoiding ambiguity, PHP community decided to solve the classic <?xml?> problem, caused by short code block, via an explicit <?php ?> which is the suggested, default one.
This is also standards safe, in the meaning that a nodeType 7 is defined as a [PROCESSING\_INSTRUCTION\_NODE](http://www.w3.org/2003/01/dom2-javadoc/org/w3c/dom/Node.html#PROCESSING_INSTRUCTION_NODE)
In few words _mjst_ is compatible with both valid XML and XHTML, which means that its templates can be created via standard DOM API being sure the template will be valid as well.
At the same time, using official engines to validate and parse templates blocks _mjst_ could be considered **more** **reliable** than other solutions, more **robust**, and at the same time **fast**, thanks to core functionality.
The good part, at least for me, is that delegating templates parsing operations to the browser core, is more probable that the error is inside a non valid template block, rather than inside this tiny library source code: a welcome side-effect about standards and core validation.

## Why Fast ##
Every transformation could create one or two pre-compiled functions reused every time we would like to transform an already parsed template block.
The reason _mjst_ creates up to two functions is that we can arbitrary send a second argument as configuration object. Since this procedure requires the usage of the [with statement](http://webreflection.blogspot.com/2009/12/with-some-good-example.html), avoiding outer scope name conflicts during the execution, and since we do not necessary need to send this second configuration object, the runtime compiled function will consider both cases, only when encountered, making the _with_ free execution 3 to 10 times faster. In other words, if we transform the same template block always without the second argument, the function that will contain the _with_ statement will never be created and vice versa.


## Why Robust ##
The XML core parser and transformer is also another reason to consider _mjst_ both fast and reliable. As example, probably the most famous [JavaScript micro templating](http://ejohn.org/blog/javascript-micro-templating/), from John Resig, is surely lightweight, but it could suffer some problem if the template block is not perfect.
For instance, try to use a string like `s = "<%"` for whatever reason, and you'll be able to break the John micro suggestion, but this is not only about John code.
Another well known product is the [EJS](http://embeddedjs.com/) library, adopted in many different environments and definitively a good piece of code.
EJS offers somethng more than _mjst_ but it is still based on manual parsing over a syntax that XML does not like that much. This means that we could have hard life to generate EJS templates via server or directly in our page while _mjst_ delegates template validity to the markup itself.
```
<?xml version="1.0" ?> 
<script id="mytpl" type="text/html">
  <!-- msjt accepts valid XML (as XHTML as well) or HTML5 -->
  <?js
    var hello = "mjst is here!";
  ?>
  <js-hello />
</script>
```

## Why ... Generally Speaking ##
I am a PHP developer, before being a JavaScript one, and I have always complained about the open close everythere PHP style. This technique does not split presentation and business logic layers and it is generally "slower than a single echo".
I have started to appreciate the couple XML and XSL-T years ago but XSL-T sometimes is just a pain in the ass and via server is difficult to cache XSL-T instances.
As example, the [New York Time](http://code.nytimes.com/projects/xslcache) had to create their own core library to speed up transformations over common XSL files allowing fast serialization. Brilliant, but still this ad hoc library does not scale for the whole World Wide Web scenario.
Different hosts, different PHP versions, but at the end of the day, what could happen if we delegate the transformation to the client side via core JavaScript features?
Nothing bad, actually it's almost a year I am transforming complex layout into html in the fastest way ever even in IE6 and only thanks to XSL-T but, as I have said, the XSL syntax could not sound familiar at all, specially for programmers that would like to have much more power while they generate a layout.
This is basically the reason PHP had such great success over these years, so why don't try to emulate XSL bringing there directly JavaScript rather than XSL syntax, and in a PHP familiar style?
This is all about this experiment. It delegates layout render into the client side, the best place imho to do this.
It avoids useless server side stress, it could be embed in the page thanks to the fake script with an unknown type, and as side effect, it could speed up client server interactions re-using templates blocks whenever we need and requiring only data, which nowadays, it is just all we need to make Web users happy.
So, as pure final evil plan, we could create a view able to produce _mjst_ templates directly via [CouchDB](http://couchdb.apache.org/) resolving some greedy _map_ _reduce_ operation in the db moving partial logic in the client via simple row data sets or generating clear layout directly via Server Side JavaScript so that all we need is a language, rather than 3 different technologies ... does it sound insane? ;-)