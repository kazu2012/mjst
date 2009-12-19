/*!
 * @project mjst - Micro JavaScript Template Engine
 * @repository http://code.google.com/p/mjst/
 * @author Andrea Giammarchi
 * @license Mit Style
 * @version 0.1.4.2
 */

/**
 * @requirements    for standard browsers or server side JavaScript: DOMParser and XMLSerializer constructors
 * @requirements    for Internet Explorer and ActiveXObject based browsers: Microsoft.XMLDOM
 *                                the Microsoft.DOMDocument.3.0 may be implemented as fallback if necessary but so far IE 5+ works just fine
 * @compatibility
 * @browsers
 *
 *                         Avant 11+
 *                         Chrome 1+
 *                         Firefox 0.9+
 *                         Flock 1.2+
 *                         Iceweasel 2+
 *                         IE 5.5+ (probably real 5 as well)
 *                         K-Meleon 1.5+
 *                         Navigator 8+
 *                         Opera 8+
 *                         Safari 3+
 *                         SeaMonkey 1.1.14+
 *                         Epiphany 2+
 *                         Iceape 1.1+
 *                         Kazehakase 0.5+
 *                         Galeon 2+
 *                         Shiretoko 3.5+
 *
 * @server         every server side language should be able to pre parse mjst files without affecting <?js ?> nodes.
 *
 * @jsserver
 *                         coming soon tests for Rhino, Helma, V8CGI, and others ... any help would be appreciated
 */

/**
 * @concept    The idea behind mjst is just the PHP stack. The same way PHP
 *                     parses its own scripts mjst parses its own tags. No conflicts
 *                     should be created if PHP short tag is *disabled*, a default 
 *                     and suggested configuration in any case.
 *                     Since PHP, as every other server side language, will parse its own tags
 *                     and nothing else, it is possible to create, if necessary, runtime <?js ?> tags
 *                     assigning whatever variable we need directly, as example, via json_encode
 *                     json_encode is 3 times faster than serialize and the layout will be a JavaScript
 *                     problem. Via mjst is possible to create fastest responses thanks to
 *                     delegated computation. The result is an XML+XSL(T) similar operation
 *                     except the template will use JavaScript rather than XSL to create the final layout.
 *                     Moreover, mjst is based on XML templates representation so the "valid template"
 *                     problems is simply delegated to whatever XML parser the server is able to use.
 *                     Once a template is valid XML, the rest is a front-end/JavaScript problem (team friendly then)
 *                     mjst would like to work with Rhino, Helma, Jaxer, V8CGI, and other server side JavaScript as well.
 *                     Right now no official tests but something will arrive soon.
 *                     Finally, I am planning to implement a sort of tutorial for CouchDB in order
 *                     to create a full stack Web based Application directly via JavaScript and nothing else, database included.
 *
 * @cache        to emulate data caching it is possible to store data in the client side.
 *                     This means that other intractions do not need to refetch same data from the database, as example,
 *                     because data has been already assigned, hopefully via namespace, in the client side.
 *                     Of course it is still possible to use APC, memcache, or other common server cache strategies as well.
 *
 * @mustconsider-that
 *                     mjst ideal scenario is the real Ajax, the one with XML rather than JSON or text at the end of the acronym.
 *                     mjst could be in any case used via <script type="tpl/mjst">...structure...</script> nodes in the middle of the page.
 *                     This will make templates load operation transparent (zero latency) and we do not need necesary to produce html,
 *                     In fact, we could simply put a piece of library inside a mjst node in order to lazy evaluate its content.
 *                     In few words mjst could be a nice solution for mobile devices as well as explained in different
 *                     "Fast or even Faster WebPage" articles around the net.
 *                     On the other hand, if the page will rely 100% into mjst parsed via clients, rather than pre parsed in the server,
 *                     search engines could have some problem to understand the page content unless these won't be able
 *                     to analize pieces of JSON as well as part of web page content.
 */

/**
 * @example
 * 
 * // via text (e.g. Ajax or innerHTML from a template node)
 * myEl.innerHTML = mjst('<?js var hello = "Hi There"; ?><js-hello/>');
 * 
 * // classic template node example
 * <script id="mytpl" type="text/html">
 *     <?js
 *         var hello = "Hi There";
 *     ?>
 *     <js-hello/>
 * </script>
 * myEl.innerHTML = mjst(document.getElementById("mytpl"));
 * 
 * // via XML (e.g. Ajax or a created document)
 * myEl.innerHTML = mjst(new DOMParser().parseFromString('<root><?js var hello = "Hi There";?><js-hello/></root>', "text/xml"))
 */

(function (window) {

/**
 * Transform a list of nodes into JavaScript and HTML strings operations
 * @param {DOMCollection} childNodes    generic HTML/XML collection
 * @param {Array} data    string list to build up the function body
 * @return {Array} modified string list
 */
function html(childNodes, data) {
    for (var i = 0, length = childNodes.length, xml, nodeName, tmp; i < length; ++i) {
        switch ((xml = childNodes[i]).nodeType) {
            case 1:
            case 7:
                /** JavaScript nodes can be called js, jst, mjs, mjst, jscript, or javascript case insensitive
                 * If anybody is asking why there is no "script" support the answer is:
                 * mjst is a template engine, and as template engine it MUST be possible to create or handle <script> nodes as well for the layout!
                 * 
                 * <js>...</js> will evaluate the content which should be inside a comment, or inside a CDATA section (valid template output)
                 * <?js ...?> this is case 7, same as above except it does not require CDATA or comments
                 * <js-myVar/> this will put directly myVar in the flow (content) as evaluated variable.
                 * 
                 * The latter case equivalent in other templates system is <%=myVar%>
                 * To avoid client/server ambiguity and to respect standards I have decided that <%=myVar%> won't be supported.
                 * In any case, we are talking about just one extra character .................. <js-myVar/>
                 * I am considering to implement a runtime namespace to handle this case as well <js:myVar/> but right now this is not supported
                 * 
                 * The short tag <js-varname/> tag cannot contain every special character so
                 * the most flexible way to print out a variable is PHP style: <?js print(whatever[0].weNeed["for" + purpose]) ?>
                 * Latter example is necessary if we do not want to normalize every reference name.
                 */
                if (tmp = (nodeName = xml.nodeName).match(/^(?:js|jst|mjs|mjst|jscript|javascript)(?:-([$.[\]"'+\w]+))?$/i)) {
                    data.push(tmp[1] ? "print(" + tmp[1] + ")" : nodeValue(xml), n);
                } else {
                    for(var
                        attributes = xml.attributes || [],
                        j = 0, l = attributes.length,
                        tmp = data.push(id, ".push('<", nodeName = nodeName.toUpperCase());
                        j < l; ++j
                    )
                        // attributes cannot use directly JavaScript: these are simply ... attributes!
                        // It is possible in any case to reference a variable already defined
                        // <?js
                        //     for(var i = 0, isLast; i < rows.length; ++i){
                        //         isLast = (i === rows.length - 1 ? "last-one" : "");
                        // ?>
                        //     <br class="${isLast}" />
                        // <?js
                        // }
                        // ?>
                        data.push(" ", (tmp = attributes[j]).name, "=\\'", value(tmp.value, true), "\\'")
                    ;
                    if (xml.hasChildNodes()) {
                        data.push(">')", n);
                        html(xml.childNodes, data);
                        data.push(id, ".push('</", nodeName, ">')", n);
                    } else if (/^(?:script)$/i.test(nodeName)) {
                        data.push("></", nodeName, ">')", n);
                    } else
                        data.push("/>')", n)
                    ;
                };
                break;
            default:
                // comments or other nodes will be simply replicated without HTML conversion but still JavaScript parsing
                // e.g. <!-- User: ${navigator.userAgent} --> will be transformed into
                //    <!-- User: Mozilla,Chrome,Safari,Opera or Shenaningans ... I meant IE -->
                data.push(id, ".push('" + value(outerHTML(xml), false) + "')", n)
                break;
        };
    };
    return data
};

/**
 * Retrieve a generic node content taking care of Firefox 4Kb limit over XML nodes
 * see http://code.google.com/p/google-web-toolkit/issues/detail?id=719 for more details
 * @param {DOM} xml generic XML/HTML node with a text content
 * @return {String} the generic DOM node content
 */
function nodeValue(xml) {
    // maybe it's a Firefox specific problem but in any case
    // this function helps to retrieve content in comment, CDATA, and other nodes
    // I don't think I'll ever remove this private function
    // TODO: think about it
    if(xml.nodeType === 1) {
            for(var
                childNodes = xml.childNodes,
                data = [],
                i = 0, length = childNodes.length;
                i < length; ++i
            )
                data[i] = nodeValue(childNodes[i])
            ;
            return data.join("");
    } else
        return xml.nodeValue
    ;
};

/**
 * Replace characters for a safe parse or put variables in the middle of the string
 * @param {String} string a matched string to sanitize
 * @param {String} match optional variable name ${myVar} => myVar
 * @return {String} replaced string
 */
function replace(string, match) {
    return string.length === 1 ? replace[string] : "'," + match + ",'";
};
 
/**
 * Sanitize strings for safe function body evaluation. Swap variables if presents.
 * @param {String} data generic string to sanitize 
 * @param {Boolean} xml only if it is an XML attribute requires an extra replace
 * @return {String} sanitize string
 */
function value(data, xml) {
    return (xml ? data.replace("'", "&apos;") : data)
        //TODO: be sure \x08 and \f are the same in IE - edge cases though (see replace properties around line 300)
        .replace(/\\|\x08|\f|\n|\r|\t|\$\{([$.[\]"'+\w]+)\}/g, replace)
    ;
};

/**
 * Private scope variables
 * @private {String} id the unique id used to perform different operations during the process
 * @private {String} n the new line character
 * @private {String} print common injected function body print function
 * @private {Function} Function the global Function to create new Function saving original reference (hopefully ...)
 * @private {Object} cache object used as pre-compiled functions storage. Each transformation could create 1 or 2 functions as Array.
 * @private {DOMParser} xml DOMParser reused instance
 * @private {Function} loadXML function to convert plain text templates into XML
 * @private {Function} outerHTML function able to retrieve the outer content of a generic node
 */
var id = "_mjst_" + (+new Date()),
    n = "\n",
    print = "function print(){" + id + ".push.apply(" + id + ",arguments)}" + n,
    Function = window.Function,
    cache = {},
    xml, loadXML, outerHTML
;

try{
    // Standards Browsers
    xml = new DOMParser;
    
    /**
     * Try to load xml or xhtml string content into an XML document
     * If the string is not valid, throws an exception with the reason
     * @param {String} data valid xml/xhtml to parse
     * @return {XMLNode} firstChild of the loaded document (remove automatically mjst node from the output)
     */
    loadXML = function loadXML(data) {
        var tmp = xml.parseFromString(data, "text/xml"), e;
        if(tmp.documentElement.nodeName == "parsererror")
            throw new Error(nodeValue(tmp.documentElement) + n + data)
        ;
        return tmp.firstChild;
    };
    
    /**
     * Return outer content of a generic XML node (nodeType different from 1 and 7)
     * @param {XMLNode} xml generic node to convert into string
     * @return {String} outer content of the node
     */
    outerHTML = (function (xml) {
        return function outerHTML(data) {
            return xml.serializeToString(data);
        };
    })(new XMLSerializer);
} catch(e) {
    // Internet Explorer ...
    xml = new ActiveXObject("Microsoft.XMLDOM");
    // I promise the day somebody will have a single problem with sync loadXML I'll remove next comment
    //xml.async=false;
    
    /**
     * Try to load xml or xhtml string content into an XML document
     * If the string is not valid, throws an exception with the reason
     * @param {String} data valid xml/xhtml to parse
     * @return {XMLNode} firstChild of the loaded document (remove automatically mjst node from the output)
     */
    loadXML = function loadXML(data) {
        if(!xml.loadXML(data))
            throw new Error(xml.parseError.reason + n + data)
        ;
        return xml.firstChild;
    };
    
    /**
     * Return outer content of a generic XML node (nodeType different from 1 and 7)
     * @param {XMLNode} xml generic node to convert into string
     * @return {String} outer content of the node
     */
    outerHTML = function outerHTML(data) {
        return data.outerHTML || data.xml;
    };
};

// set characters to sanitize
//TODO: be sure IE does not mess up with some char (e.g. \b and \f) - edge cases though
replace["\\"] = "\\\\";
replace["\b"] = "\\b";
replace["\f"] = "\\f";
replace["\n"] = "\\n";
replace["\r"] = "\\r";
replace["\t"] = "\\t";

/**
 * Public core function able to transform JavaScript templates into valid HTML
 * Code execution is partially sandboxed inside the runtime compiled function.
 * It's a good practice to define templates variables local via "var" prefix
 * But if we need global scope, we can simply use it. This is good for cached data.
 * @param {String/DOM} xml a template via string or an XML template document or an HTML node with a template content (e.g. <script type="text/html">...</script>)
 * @param {Object} data optional arguments to pass via "with" into Function body. Since "with" is a slower operation it is not implemented when data is empty while it is implemented if data is a generic object. This means a template could have up to two pre-compiled functions assigned (one with a "with" statement, one without)
 * @return {String} transformed template as valid HTML string
 */
window.mjst = function mjst(xml, data) {
    var string = typeof xml === "string",
        tmp = string ? xml : outerHTML(xml),
        value = cache[tmp] || (cache[tmp] = []),
        i = data ? 1 : 0
    ;
    return (value[i] || (value[i] = new Function(id, print.concat(
        i ?
            // arguments annihalation
            // if we pass a configuration/data object arguments will be that object
            // if we don't pass anything "with" statement won't exist (faster)
            // and arguments will be undefined
            "with(arguments=arguments[1]){" :
            "arguments=arguments." + id + n
        ,
        // silly check to understand if the node is XML or HTML (e.g. script one)
        (string || typeof xml.className === "string" ?
            html(loadXML("<".concat(id, ">", string ? xml : xml.innerHTML, "</", id, ">")).childNodes, []) :
            // XML could be loaded via Ajax or created runtime or passed as single node
            // just to be sure we are parsing the correct childNodes list
            html((xml.documentElement || xml).childNodes, [])
        ).join(""),
        i ? "}" : "",
        "return ", id
    ))))([],data).join("");
};
})(this);