
JAVA_BIN = java
CLOSURE_CC = $(JAVA_BIN) -jar 

api.min.js: api.js color.js html2canvas.js quantize.js text.js shot.js
	$(CLOSURE_CC) ../bin/closure-compiler.jar --js api.js --js color.js --js html2canvas.js --js quantize.js --js text.js --js_output_file api.min.js shot.js

clean:
	rm *.min.js

