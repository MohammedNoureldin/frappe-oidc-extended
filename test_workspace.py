"""Validate the workspace fixture without needing a live site.

Guards the two ways this file silently breaks:
  - a content block references a card_name that no Card Break builds
  - a Card Break exists that no content block ever renders
Either one leaves links invisible in the Desk sidebar with no error anywhere.
"""

import json
import pathlib

WS = (
    pathlib.Path(__file__).parent
    / "oidc_extended/oidc_extended/workspace/oidc_extended/oidc_extended.json"
)


def test_workspace_cards_resolve():
    ws = json.loads(WS.read_text())
    referenced = {b["data"]["card_name"] for b in json.loads(ws["content"]) if b["type"] == "card"}
    built = {l["label"] for l in ws["links"] if l["type"] == "Card Break"}

    assert not referenced - built, f"content references cards with no Card Break: {referenced - built}"
    assert not built - referenced, f"Card Break never rendered by content: {built - referenced}"

    # A Link before the first Card Break lands in frappe's implicit "Link" card,
    # which no content block can reference.
    assert ws["links"][0]["type"] == "Card Break", "links must open with a Card Break"

    assert ws["module"] == "OIDC Extended"
    assert ws["app"] == "oidc_extended"


if __name__ == "__main__":
    test_workspace_cards_resolve()
    print("workspace fixture OK")
