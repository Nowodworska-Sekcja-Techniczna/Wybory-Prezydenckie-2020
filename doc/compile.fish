#!/usr/bin/env fish

while inotifywait -e close_write main.tex
  xelatex -interaction=nonstopmode st.tex
  xelatex -interaction=nonstopmode main.tex
end

