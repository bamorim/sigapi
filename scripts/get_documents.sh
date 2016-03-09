#!/bin/sh

FNAME=$(mktemp)
casperjs get_documents.js $1 $2 $3 $FNAME
pdftotext -layout $FNAME -
