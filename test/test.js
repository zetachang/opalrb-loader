var assert = require('assert');

describe('Opal compiler', function(){
  it('should correctly export to global scope', function(){
    require("../vendor/opal-compiler");
    
    assert.equal(Opal !== undefined, true);
  })

  it('should compile ruby source', function(){
    require("../vendor/opal-compiler");
    
    var compiler = Opal.Opal.Compiler.$new('puts "Howdy #{1+2}"');    
        
    compiler.$compile();
    
    var result = compiler.$result();
        
    assert.equal(typeof result, "string");
    assert.equal(result.length > 0, true);
  })
})

describe('Opal loader', function(){
  it("should export a loader function", function(){
    var loader = require("../index")
    
    assert.equal(typeof loader, "function")
  })
})
