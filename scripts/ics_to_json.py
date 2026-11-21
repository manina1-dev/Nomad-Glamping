"""Turn an Airbnb iCal export into a list of unavailable date ranges.

Only the start and end dates of each event are kept. Guest names, phone
numbers, reservation links and every other field are dropped, so the
output is safe to publish.

Usage: python3 ics_to_json.py <calendar.ics> <output.json>
"""
import json
import sys
from datetime import date, timedelta


def unfold(text):
    lines = []
    for raw in text.replace("\r\n", "\n").split("\n"):
        if raw[:1] in (" ", "\t") and lines:
            lines[-1] += raw[1:]
        else:
            lines.append(raw)
    return lines


def to_date(value):
    v = value.strip()[:8]
    return date(int(v[:4]), int(v[4:6]), int(v[6:8]))


def parse(text):
    if "BEGIN:VCALENDAR" not in text:
        raise ValueError("not an iCal calendar")
    ranges, start, end, in_event = [], None, None, False
    for line in unfold(text):
        name, _, value = line.partition(":")
        key = name.split(";", 1)[0].upper()
        if line.startswith("BEGIN:VEVENT"):
            in_event, start, end = True, None, None
        elif line.startswith("END:VEVENT"):
            if start:
                ranges.append((start, end if end and end > start else start + timedelta(days=1)))
            in_event = False
        elif in_event and key == "DTSTART":
            start = to_date(value)
        elif in_event and key == "DTEND":
            end = to_date(value)
    ranges.sort()
    merged = []
    for s, e in ranges:
        if merged and s <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    return [[s.isoformat(), e.isoformat()] for s, e in merged]


def main():
    src, out = sys.argv[1], sys.argv[2]
    with open(src, encoding="utf-8", errors="replace") as f:
        ranges = parse(f.read())
    data = {"source": "airbnb", "unavailable": ranges}
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1)
        f.write("\n")
    print(f"{len(ranges)} unavailable range(s) written to {out}")


if __name__ == "__main__":
    main()
