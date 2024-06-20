"""
This test file is used in the 'Exec Globals' test case.
"""

def test_global(key, expected_value):
    value = globals().get(key)
    assert value == expected_value, f"{key} is incorrect, expected {expected_value}, got {value}"

test_global("test_boolean", True)
test_global("test_none", None)
test_global("test_number", 42)
test_global("test_array", [1, 2, 3])
test_global("test_dict", {"inner_dict": {"a": 1, "b": 2}})

string = globals().get("test_string")
print(string)
