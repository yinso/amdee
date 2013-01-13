VPATH=src
BUILDDIR=lib

COFFEE_SOURCES= $(wildcard $(VPATH)/*.coffee)
COFFEE_OBJECTS=$(patsubst $(VPATH)/%.coffee, $(BUILDDIR)/%.js, $(COFFEE_SOURCES))

all: build

.PHONY: build
build: node_modules objects 

.PHONY: objects
objects: $(COFFEE_OBJECTS)

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
