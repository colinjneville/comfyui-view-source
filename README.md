# view-source
Quickly open the source code to nodes in ComfyUI. Right click on a node and select `View Node Source`.

By default, the source file will be opened with the OS's associated application. The plugin settings allow you to choose a specific application and command line arguments. You can also use the node class's name and line number in your command line arguments to open directly to the node, if your editor supports it. 
| placeholder | substitution | 
|---|---|
| %f | source file path |
| %l | source line number |
| %n | node class name |

For example, to open directly to the node in VSCode:
| setting | value |
|---|---|
| Executable | code |
| Argument 0 | --goto |
| Argument 1 | %f:%l |

## Notes

The command line is currently implemented as a setting value per argument (up to 4 arguments) to aid argument escaping. If you need more arguments, you can change `SETTINGS_ARGUMENT_LEN` in `.js/view_source.js`.  

This should theoretically work on Linux, but has only been tested on Windows.

Attempting to view source of a subgroup will fail, as there is no source.