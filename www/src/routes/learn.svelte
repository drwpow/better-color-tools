<div class="wrapper">
  <h1>Learn</h1>
  <p>A crash course on a few basic color science acronyms, abbreviations, and concepts.</p>
  <p>
    <i
      >Editor’s note: the capitalizations of colorspaces are wacky. For example, <em>LAB</em>, <em>Lab</em>, and <em>L*a*b*</em> are all just different stylizations of the same colorspace. No, I don’t get it, either. To help with confusion, I refer to colorspaces
      on this page in CAPITAL LETTERS (e.g. LAB).</i
    >
  </p>

  <dl>
    <dt id="gamma">Gamma</dt>
    <dd>
      <p>
        Gamma (or more accurately, <em>gamma correction</em>) is the process of “curving” light output of a display (making certain colors seem darker or lighter than they really are) to better match human color perception. Every color you see on a digital
        monitor (even now!) has been gamma corrected to be easier to perceive by the human eye.
      </p>
      <p>
        If monitors displayed color in absolute brightness, to most humans it would appear as a blinding white rectangle with only a few spots being subtly-darker, or subtly-colored. This is because humans are far more sensitive to differences in dark
        colors than light colors. And so, colors are run through a <a href="https://en.wikipedia.org/wiki/Gamma_correction" target="_blank">mathematical function</a>
        that converts values into ones that better map to humans’ <a href="https://en.wikipedia.org/wiki/Trichromacy" target="_blank">trichromatic vision</a>.
      </p>
      <p>The most common example of this is the <a href="#srgb">sRGB colorspace</a>. Most people don’t realize sRGB is a gamma-corrected interpretation of RGB, and sRGB skews heavily toward darker colors.</p>
    </dd>
    <dt id="hsl">HSL / HWB / HSV</dt>
    <dd>
      <p>A useless colorspace that should never be used.</p>
      <p>
        While HSL’s <em>design</em> is fantastic—separating color into <strong>H</strong>ue, <strong>S</strong>aturation, and <strong>L</strong>ightness—its <em>implementation</em> is
        <a href="https://en.wikipedia.org/wiki/HSL_and_HSV#Disadvantages">deeply-flawed</a>. It was designed in the 1970s to be an easier method of choosing colors without complicated math. But its lack of complicated math is what produces a warped
        colorspace that is unusable in practice. Its biggest problem is with lightness: <span class="color" style="background-color:hsl(240, 100%, 50%)" /> dark blue, <span class="color" style="background-color:hsl(60, 100%, 50%)" /> bright yellow, and
        <span class="color" style="background-color:hsl(280, 100%, 50%)" /> dark purple all have the same lightness value (50%), when it’s obvious those colors vary wildly in luminance.
      </p>
      <p>Put another way, HSL fails at both being a human-perceptive colorspace and an objective value colorspace.</p>
      <p>HWB and HSV are just remappings of the same approach, and thus inherit the same problems.</p>
      <p>
        Instad, a colorspace like <a href="#oklch">OKLCH</a> should be used which works the same way (just swap <strong>S</strong>aturation with <strong>C</strong>hroma), but
        <a href="https://bottosson.github.io/posts/oklab/#comparing-oklab-to-hsv" target="_blank">accurately preserves lightness</a> and does a better job of evenly representing hues.
      </p>
    </dd>
    <dt id="lightness">Lightness</dt>
    <dd>
      <p>
        The <em>perceived</em> brightness of a color, as opposed to <a href="#luminance">luminance</a>, the <em>absolute</em> brightness of a color.
      </p>
      <p>
        Human eyesight has evolved to be more sensitive to certain bands of light than others, and so <a href="https://en.wikipedia.org/wiki/CIE_1931_color_space#CIE_xy_chromaticity_diagram_and_the_CIE_xyY_color_space" target="_blank"
          >recreating this mathematically</a
        >
        is incredibly complex and the subject of ongoing research. So the term “lightness” refers generally to any mathematical attempt at reproducing human light sensitivity. This invariably involves some method of <a href="#gamma">gamma correction</a>.
      </p>
      <p>The calculation of “lightness” is not standardized, and the results will vary depending on the method used (e.g. <a href="#oklab">OKLAB</a>).</p>
    </dd>
    <dt id="luminance">Luminance</dt>
    <dd>
      <p>The absolute brightness of a light source, as measured in lumens. Humans don’t perceive absolute brightness linearly, which is why <a href="#gamma">gamma correction</a> is needed.</p>
    </dd>
    <dt id="oklab">OKLAB</dt>
    <dd>
      <p>“It is called the <em>OKLAB</em> color space, because it is an OK <a href="https://en.wikipedia.org/wiki/CIELAB_color_space" target="_blank">LAB</a> color space.”</p>
      <p>
        A colorspace <a href="https://bottosson.github.io/posts/oklab/" target="_blank">created by Björn Ottosen in 2020</a> with the purpose of improving the human-perceptive
        <a href="https://en.wikipedia.org/wiki/CIELAB_color_space" target="_blank">LAB</a>
        colorspace from 1976. It stands for <strong>L</strong>ightness (perceived brightness), <strong>A</strong> (red/green axis), and <strong>B</strong> (blue/yellow axis).
      </p>
      <p>Those of you old enough to have used a CRT may have noticed red/green and blue/yellow picture color adjustments in the TV settings. That’s LAB!</p>
      <p>
        Björn posted a <a href="https://bottosson.github.io/posts/oklab/" target="_blank">very thorough explanation</a> of the thought behind OKLAB as well as math and code samples to encourage adoption. And adopt people have—it’s recieved unanimous praise
        from color scientists, and it’s even
        <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklab" target="_blank">supported in Safari today</a>.
      </p>
    </dd>
    <dt id="oklch">OKLCH</dt>
    <dd>
      <p>
        Just as the <a href="https://en.wikipedia.org/wiki/CIELAB_color_space#Cylindrical_model" target="_blank">LCH</a> colorspace (<strong>L</strong>ightness, <strong>C</strong>hroma, <strong>H</strong>ue) is a remapping of LAB, so is OKLCH to OKLAB. The
        math is the same, but since OKLAB is a different starting point from LAB, OKLCH will produce better results than traditional LCH.
      </p>
      <p>
        The general principal of LCH is to keep the <strong>L</strong>ightness axis as-is, but convert the hard-to-use A and B axes into the friendler <strong>C</strong>hroma (color intensity) and
        <strong>H</strong>ue axes.
      </p>
      <p>
        OKLCH should always be used in place of <a href="#hsl">HSL</a>, because it successfully accomplishes what most people <em>think</em> HSL does.
      </p>
    </dd>
    <dt id="xyz">XYZ</dt>
    <dd>
      <p>A colorspace invented in 1931 to map all human-perceivable colors into a three dimensional space within [0, 0, 0] and [1, 1, 1].</p>
      <p>
        To be perfectly honest I don’t have a good understanding of why this is still so prevalent. My only experience with it is that most color math still relies on XYZ for converting from one colorspace to another. Perhaps its existence is explained by
        simply being the foundation of modern color science, and there hasn’t been a need to replace this model.
      </p>
    </dd>
  </dl>
</div>

<style lang="scss">
  .wrapper {
    font-size: 18px;
    padding-left: 2rem;
    padding-right: 2rem;
    margin-bottom: 8rem;
  }

  h1 {
    font-size: 60px;
    font-weight: 550;
    margin-top: 0.5em;
  }

  p {
    line-height: 1.8;
    max-width: 50em;
  }

  dt {
    font-size: 32px;
    font-weight: 500;
    margin-top: 2em;
  }

  dd {
    margin: 0;
    padding: 0;
  }

  .color {
    border-radius: 50%;
    display: inline-block;
    height: 0.75em;
    width: 0.75em;
  }
</style>
