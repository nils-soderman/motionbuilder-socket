assert globals().get("test_number") == 42
assert globals().get("test_array") == [1, 2, 3]
assert globals().get("test_dict") == {"a": 1, "b": 2}

string = globals().get("test_string")
print(string)
