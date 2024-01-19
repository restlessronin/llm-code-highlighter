const test_file_with_identifiers = {
  relPath: 'test_file_with_identifiers.py',
  code: `class MyClass:
  def my_method(self, arg1, arg2):
    return arg1 + arg2

def my_function(arg1, arg2):
  return arg1 * arg2
`,
};

const test_file_pass = {
  relPath: 'test_file_pass.py',
  code: `pass`,
};

const test_file_import = {
  relPath: 'test_file_import.py',
  code: `from test_file_with_identifiers import MyClass

obj = MyClass()
print(obj.my_method(1, 2))
print(my_function(3, 4))
`,
};

export const allSources = [test_file_with_identifiers, test_file_import, test_file_pass];
