# razor-lang

This is an extension to serve as a side-addition to many of the current features ASP.Net Core provides, but for existing ASP.Net 4.x projects, as well as some of the larger refactoring analysis tools.  Currently the tool is very light, but new functionality will be added as requirements and features come to light.

## Features

* Allows standard conventional routing of Razor partial render calls, checking on the typical fallthrough of current folder, and then the shared folder.
* Does not require or affect what build the aspnet is, only that `@Html.RenderPartial("path/to/something")` can find `path/to/something` in an appropriate location

## Requirements

Requires: ASP.Net

## Extension Settings

This extension consumes the following settings:

* `razor-lang.enable`: enable/disable this extension

## Known Issues



## Release Notes

Initial release!

### 0.0.1

Initial release of razor-lang

## Working with Markdown

* Split the editor (`Cmd+\` on OSX or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on OSX or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (OSX) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)
