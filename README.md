# ASPNet View Tools

This is an extension to serve as a side-addition to many of the current features ASP.Net Core provides, but for existing ASP.Net 4.x projects, as well as some of the larger refactoring analysis tools.  Currently the tool is very light, but new functionality will be added as requirements and features come to light.

## Features

* Allows standard conventional routing of Razor|Webforms partial render calls, checking on the typical fallthrough of current folder, and then the shared folder.
* Does not require or affect what build the aspnet is, only that `Html.RenderPartial("path/to/something")` can find `path/to/something` in an appropriate location

## Requirements

Requires: ASP.Net 4.x

## Extension Settings

This extension consumes the following settings:

* `aspnetViews.SharedPaths`: The array of shared view paths, in order of fulfillment, for the project.   Defaults to `['Views/Shared']`

## Known Issues

* There is currently a very basic tmTheme applied, where formatting within the aspnet tags is not completely formatted correctly.
* RenderPartial calls from within an html string do not parse as calls, the aforementioned textmate grammar needs corrected first

## Release Notes

Initial release!

### 0.0.1

Initial release of razor-lang

### 0.0.2

Added ASPX|ASCX|MASTER pages to the matcher, along with the support for Shared path lookups

### 0.0.3

Incorporated a previous tmTheme that extended html for mild syntax highlighting

### 0.1.0

* Fixed inline string bugs in aspx/ascx/master pages
* added CSS embedded styling also
* Set styling to more consistent scoping for future theming
