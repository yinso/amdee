# Amdify

## Overview

Amdify is a command-line tool for converting Node style packages into client-side scripts that cooperates with (requireJS)[http://www.requirejs.org].

    node amdify.js --source <module_directory> --target <output_directory>

Amdify will convert the module into a single script that can be loaded on the client-side. The dependent modules are converted into their own script as well, and requireJS is used to handle the async loading dependency.
