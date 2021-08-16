import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'package:path/path.dart';
import 'package:dio/dio.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  var _uploadURL = '';
  var _id = '';
  var _fileSelected = false;
  var _displayText;
  late File _localFile;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        print('tap');
        FocusScope.of(context).requestFocus(FocusNode());
      },
      child: MaterialApp(
        theme: ThemeData(
          textButtonTheme: TextButtonThemeData(
            style: TextButton.styleFrom(
                primary: Colors.black,
                backgroundColor: Colors.lightGreenAccent,
                side: BorderSide(color: Colors.grey, width: 1)),
          ),
        ),
        home: SafeArea(
          child: Scaffold(
            resizeToAvoidBottomInset: false,
            appBar: AppBar(
                title: Text(
              "Upload file to server",
            )),
            body: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Expanded(
                    child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(child: Container()),
                    Expanded(
                      child: TextButton(
                        child: Text(
                          'Capture Image',
                          textAlign: TextAlign.center,
                        ),
                        onPressed: () {
                          _captureImage();
                        },
                      ),
                    ),
                    Expanded(child: Container()),
                    Expanded(
                      child: TextButton(
                        child: Text(
                          'Browse Image',
                          textAlign: TextAlign.center,
                        ),
                        onPressed: () {
                          _browseImage();
                        },
                      ),
                    ),
                    Expanded(child: Container()),
                  ],
                )),
                Expanded(
                  flex: 2,
                  child: _fileSelected == false
                      ? Container(
                          decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey)),
                          child: Container(
                            color: Colors.blueGrey[100],
                            child: Center(
                              child: Text(
                                'Select an image to preview!',
                              ),
                            ),
                          ),
                        )
                      : Image.file(_localFile),
                ),

                ///////////////////
                Expanded(
                  flex: 2,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Expanded(
                              child: Center(
                                  child: Text(
                            'URL',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ))),
                          Expanded(
                            flex: 5,
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: TextField(
                                decoration: InputDecoration(
                                    fillColor: Colors.cyan[100],
                                    filled: true,
                                    border: OutlineInputBorder(),
                                    hintText:
                                        'Enter url address to upload image'),
                                onChanged: (url) {
                                  print('URL address: $url');
                                  setState(() {
                                    _uploadURL = url;
                                  });
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Expanded(
                              child: Center(
                                  child: Text(
                            'ID',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ))),
                          Expanded(
                            flex: 5,
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: TextField(
                                decoration: InputDecoration(
                                    fillColor: Colors.cyan[100],
                                    filled: true,
                                    border: OutlineInputBorder(),
                                    hintText: 'Enter ID'),
                                onChanged: (id) {
                                  print('ID address: $id');
                                  setState(() {
                                    _id = id;
                                  });
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(child: Container()),
                      Expanded(
                        flex: 2,
                        child: TextButton(
                          child: Text(
                            "Upload",
                            textAlign: TextAlign.center,
                          ),
                          style: ButtonStyle(
                              backgroundColor: MaterialStateProperty.all(
                                  Colors.yellowAccent)),
                          onPressed: () {
                            setState(() {
                              _displayText = "Uploading ...";
                            });
                            if (_fileSelected) {
                              _uploadImage(_localFile);
                            } else {
                              setState(() {
                                _displayText = "Please select an image!";
                              });
                            }
                          },
                        ),
                      ),
                      Expanded(child: Container()),
                      Expanded(
                        flex: 2,
                        child: TextButton(
                          child: Text(
                            "Train",
                            textAlign: TextAlign.center,
                          ),
                          style: ButtonStyle(
                              backgroundColor:
                                  MaterialStateProperty.all(Colors.redAccent)),
                          onPressed: () {
                            if (_uploadURL == '') {
                              setState(() {
                                _displayText =
                                    "Please input a valid URL address!";
                              });
                            } else {
                              setState(() {
                                _displayText = "Sending TRAIN command ...";
                                _sendTrainCommand();
                              });
                            }
                          },
                        ),
                      ),
                      Expanded(child: Container()),
                    ],
                  ),
                ),

////////
                Expanded(
                  flex: 4,
                  child: Center(
                      child: _displayText == null
                          ? Text("Status: Ready")
                          : Text("Status: $_displayText")),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future _captureImage() async {
    final _pickedImage =
        await ImagePicker().getImage(source: ImageSource.camera);
    if (_pickedImage != null) {
      setState(() {
        _fileSelected = true;
        _localFile = File(_pickedImage.path);
      });
    }
  }

  Future _browseImage() async {
    FilePickerResult? _browsedImage = await FilePicker.platform.pickFiles(
        type: FileType.custom, allowedExtensions: ['jpg', 'png', 'bmp']);
    if (_browsedImage != null) {
      setState(() {
        _fileSelected = true;

        _localFile = File(_browsedImage.files.single.path!);
      });
    }
  }

  Future _uploadImage(File _toUploadFile) async {
    bool _err = false;

    if (_uploadURL == '') {
      setState(() {
        _fileSelected = true;
        _displayText = "Please input a valid URL address!";
      });
      return;
    }
    if (_id == '') {
      setState(() {
        _fileSelected = true;
        _displayText = "Please input ID!";
      });
      return;
    }
    Dio dio = Dio();
    var filename = basename(_toUploadFile.path);
    var formData = FormData.fromMap({
      'image':
          await MultipartFile.fromFile(_toUploadFile.path, filename: filename)
    });
    try {
      await dio.post(_uploadURL + '/mobile/image/' + _id, data: formData);
    } catch (e) {
      _err = true;

      setState(() {
        _displayText = 'Upload error, check URL address!';
      });
    }
    if (!_err) {
      setState(() {
        _fileSelected = false;
        _displayText = 'Done';
      });
    }
  }

  Future _sendTrainCommand() async {
    Dio dio = Dio();

    try {
      await dio.post(_uploadURL + '/web/trainModel');
    } catch (e) {
      print(e);
      setState(() {
        _displayText = 'Command sent error!';
      });
    }

    setState(() {
      _displayText = 'TRAIN Command sent successfully!';
    });
  }
}
