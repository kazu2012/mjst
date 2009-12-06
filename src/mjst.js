/*!
 * @project mjst - Micro JavaScript Template Engine
 * @repository http://code.google.com/p/mjst/
 * @author Andrea Giammarchi
 * @license Mit Style
 * @version 0.1.3
 */

/**
 * @compatibility no idea yet, tested into Firefox, IE, Chrome, Opera
 * @example
 * 
 * // via text (e.g. Ajax or innerHTML from a template node)
 * myEl.innerHTML = mjst('<?js var hello = "Hi There"; ?><js-hello/>');
 * 
 * // classic template node example
 * <script id="mytpl" type="text/html">
 *   <?js
 *     var hello = "Hi There";
 *   ?>
 *   <js-hello/>
 * </script>
 * myEl.innerHTML = mjst(document.getElementById("mytpl"));
 * 
 * // via XML (e.g. Ajax or a created document)
 * myEl.innerHTML = mjst(new DOMParser().parseFromString('<root><?js var hello = "Hi There";?><js-hello/></root>', "text/xml"))
 */

(function(window){

/**
 * Transform a list of nodes into JavaScript and HTML strings operations
 * @param {DOMCollection} childNodes  generic HTML/XML collection
 * @param {Array} data  string list to build up the function body
 * @return {Array} modified string list
 */
function html(childNodes, data){
  for(var i = 0, length = childNodes.length, xml, nodeName, tmp; i < length; ++i){
    switch((xml = childNodes[i]).nodeType){
      case 1:
      case 7:
        /** JavaScript nodes can be called js, jst, mjs, mjst, jscript, or javascript case insensitive
         * <js>...</js> will evaluate the content which should be inside a comment, or inside a CDATA section (valid template output)
         * <?js ...?> this is case 7, same as above except it does not require CDATA or comments
         * <js-myVar/> this will put directly myVar in the flow (content) as evaluated variable.
         * The latter case equivalent in other templates system is <%=myVar%>
         * To avoid client/server ambiguity and to respect standards I have decided that <%=myVar%> won't be supported.
         * In any case, we are talking about just one extra character .................. <js-myVar/>
         * I am considering to implement a runtime namespace to handle this case as well <js:myVar/> but right now this is not supported
         */
        if(tmp = (nodeName = xml.nodeName).match(/^(?:js|jst|mjs|mjst|jscript|javascript)(?:-([$.[\]"'+\w]+))?$/i)){
          data.push(tmp[1] ? "print(" + tmp[1] + ")" : nodeValue(xml), n);
        } else {
          for(var
            attributes = xml.attributes || [],
            j = 0, l = attributes.length,
            tmp = data.push(id, ".push('<", nodeName = nodeName.toUpperCase());
            j < l; ++j
          )
            // attributes caonnot use directly JavaScript: these are simply ... attributes!
            // It is possible in any case to referer to a variable already defined
            // <?js
            //   for(var i = 0, isLast; i < rows.length; ++i){
            //     isLast = (i === rows.length - 1 ? "last-one" : "");
            // ?>
            //   <br class="${isLast}" />
            // <?js
            // }
            // ?>
            data.push(" ", (tmp = attributes[j]).name, "=\\'", value(tmp.value, true), "\\'")
          ;
          if(xml.hasChildNodes()){
            data.push(">')", n);
            html(xml.childNodes, data);
            data.push(id, ".push('</", nodeName, ">')", n);
          } else
            data.push("/>')", n);
          ;
        };
        break;
      default:
        // comments or other nodes will be simply replicated without HTML conversion but still JavaScript parsing
        // e.g. <!-- User: ${navigator.userAgent} --> will be transformed into
        //  <!-- User: Mozilla,Chrome,Safari,Opera or Shenaningans ... I meant IE -->
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
function nodeValue(xml){
  if(xml.nodeType === 1){
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
function replace(string, match){
  return string.length === 1 ? replace[string] : "'," + match + ",'";
};
 
/**
 * Sanitize strings for safe function body evaluation. Swap variables if presents.
 * @param {String} data generic string to sanitize 
 * @param {Boolean} xml only if it is an XML attribute requires an extra replace
 * @return {String} sanitize string
 */
function value(data, xml){
  return (xml ? data.replace("'", "&apos;") : data)
    .replace(/\\|\b|\f|\n|\r|\t|\$\{([$.[\]"'+\w]+)\}/g, replace)
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
var id = "_mjst_" + new Date().getTime(),
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
  loadXML = function loadXML(data){
    var tmp = xml.parseFromString(data, "text/xml"), e;
    if(tmp.documentElement.nodeName == "parsererror")
      throw new Error(nodeValue(tmp.documentElement, false) + n + data)
    ;
    return tmp.firstChild;
  };
  
  /**
   * Return outer content of a generic XML node (nodeType different from 1 and 7)
   * @param {XMLNode} xml generic node to convert into string
   * @return {String} outer content of the node
   */
  outerHTML = (function(xml){
    return function outerHTML(data){
      return xml.serializeToString(data);
    };
  })(new XMLSerializer);
}catch(e){
  // Internet Explorer ...
  xml = new ActiveXObject("Microsoft.XMLDOM");
  
  /**
   * Try to load xml or xhtml string content into an XML document
   * If the string is not valid, throws an exception with the reason
   * @param {String} data valid xml/xhtml to parse
   * @return {XMLNode} firstChild of the loaded document (remove automatically mjst node from the output)
   */
  loadXML = function loadXML(data){
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
  outerHTML = function outerHTML(data){
    return data.outerHTML || data.xml;
  };
};

// set characters to sanitize
replace["\\"] = "\\\\";
replace["\b"] = "\\b";
replace["\f"] = "\\f";
replace["\n"] = "\\n";
replace["\r"] = "\\r";
replace["\t"] = "\\t";
//replace["'"] = "&apos;";

/**
 * Public core function able to transform JavaScript templates into valid HTML
 * @param {String/DOM} xml a template via string or an XML template document or an HTML node with a template content (e.g. <script type="text/html">...</script>)
 * @param {Object} data optional arguments to pass via "with" into Function body. Since "with" is a slower operation it is not implemented when data is empty while it is implemented if data is a generic object. This means a template could have up to two pre-compiled functions assigned (one with a "with" statement, one without)
 * @return {String} transformed template as valid HTML string
 */
window.mjst = function mjst(xml, data){
  var string = typeof xml === "string",
      tmp = string ? xml : outerHTML(xml),
      value = cache[tmp] || (cache[tmp] = []),
      i = data ? 1 : 0
  ;
  return (value[i] || (value[i] = new Function(id, print.concat(
      i ?
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
    ))))([],data).join("")
  ;
};  
})(this);