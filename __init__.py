"""Top-level package for view-source."""

WEB_DIRECTORY = "./js"

NODE_CLASS_MAPPINGS = { }

__all__ = ["WEB_DIRECTORY", "NODE_CLASS_MAPPINGS"]

__version__ = "0.0.1"

from nodes import NODE_CLASS_MAPPINGS as ALL_NODE_CLASS_MAPPINGS
from aiohttp import web
import server
import inspect
import logging
import os
import sys
import subprocess
import shutil

logger = logging.getLogger("view-source")

routes = server.PromptServer.instance.routes

@routes.post("/view_source")
async def view_source(request: web.Request):
    data = await request.post()
    
    class_name = data["class_name"]
    if class_name is not None:
        class_name = str(class_name)
    executable = data.get("executable", None)
    if executable is not None:
        executable = str(executable)
    arguments = data.getall("arguments", [])

    failure_detail = None

    class_object = ALL_NODE_CLASS_MAPPINGS.get(class_name, None)
    if class_object is not None:
        try:
            file_name = inspect.getfile(class_object)

            try:
                _, line_no = inspect.getsourcelines(class_object)
            except:
                line_no = 0

            try:
                # Specified executable
                if executable is not None:
                    executable = shutil.which(executable) or executable

                    arguments = [executable] + [
                        str(arg)
                            .replace(r"%f", file_name)
                            .replace(r"%l", str(line_no))
                            .replace(r"%n", class_name)
                        for arg in arguments
                    ]
                    
                    if sys.platform == "win32":
                        logger.info(f"Executing '{subprocess.list2cmdline(arguments)}'")
                    else:
                        logger.info(f"Executing {arguments}")

                    subprocess.Popen(arguments)
                # Default OS association
                else:
                    logger.info(f"Opening '{file_name}'")
                    
                    # https://stackoverflow.com/a/17317468
                    if sys.platform == "win32":
                        os.startfile(file_name)
                    else:
                        opener = "open" if sys.platform == "darwin" else "xdg-open"
                        subprocess.call([opener, file_name])
            except Exception as e:
                failure_detail = f"Could not open source file '{file_name}': {e}"
        except Exception as e:
            failure_detail = f"No source file for class '{class_object.__name__}': {e}"
    else:
        failure_detail = f"No class found for name '{class_name}'"

    if failure_detail is None:
        return web.Response()
    else:
        return web.Response(status=404, text=failure_detail)
    
