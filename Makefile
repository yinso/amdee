VPATH=src
BUILDDIR=lib

COFFEE_SOURCES= $(wildcard $(VPATH)/*.coffee)
COFFEE_OBJECTS=$(patsubst $(VPATH)/%.coffee, $(BUILDDIR)/%.js, $(COFFEE_SOURCES))

all: build

.PHONY: build
build: node_modules objects lib/nocomment.js example/output.js

lib/nocomment.js: grammar/nocomment.pegjs
	pegjs grammar/nocomment.pegjs lib/nocomment.js

.PHONY: grammar
grammar: lib/nocomment.js

.PHONY: objects
objects: $(COFFEE_OBJECTS) package.json

output:
	./bin/amdee --source src/ --target example/output.js

package.json: package.bean
	./node_modules/.bin/bean

.PHONY: test
test: build
	./node_modules/.bin/mocha --compilers coffee:coffee-script --reporter spec

.PHONY: clean
clean:
	rm -f $(COFFEE_OBJECTS)

.PHONE: pristine
pristine: clean
	rm -rf node_modules

node_modules:
	npm install -d

$(BUILDDIR)/%.js: $(VPATH)/%.coffee
	coffee -o $(BUILDDIR) -c $<

.PHONY: watch
watch:
	coffee --watch -o $(BUILDDIR) -c $(VPATH)

.PHONY: start
start:
	./node_modules/.bin/supervisor -w routes,views,lib,src,client -e coffee,hbs,js,json -q server.js
