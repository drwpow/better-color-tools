# FAQ

This doc is labelled “FAQ,” but as you may suspect with many FAQs, most of these questions have never been asked. This is more of a compendium of things too boring and too in-the-weeds for the README, but calling it a “compendium” or “appendex” or some
more-appropriate term would be more confusing, so here we are. Welcome!

## Project goals

I started this library because I frequently need to mix colors, but was constantly disappointed at how bad the results were using common tools available (see examples above; if you’ve found a tool you’re happy with, more power to you, but I never did). I
had avoided using any libraries or tools for this reason for my entire career, and instead always mixed color manually in graphics programs (in full disclosure I have a fine arts degree with a concentration in painting, which helps explain why I felt most
color tools were primitive and unusable). But over time, I had this growing feeling that others had dealt with this problem and had been similarly disappointed, and that there were solutions available; they just were just unknown to the authors making
simple color functions (including the Sass authors). After all, most programmers aren’t color scientists. And so this library is the product of finding solutions to the (deceptively-complex) problem of color mixing that aren’t god-awful, and are at least
as good as I can achieve mixing colors manually if not better.

On the other side of the divide, there are plenty of color tools that comprehensively deal with most major color spaces accurately, and are capable of mixing colors precisely. However, they posess a steep learning curve to use, and a user must have a deep
knowledge of the tool and theory to accomplish basic tasks for the purpose of making websites. And for good reason, too—there’s over a century of color science history to tackle, and those libraries are also dealing with myriad other applications beyond
computer monitor color including physical paint, printing, etc. By limiting scope to _just computer monitor color_ and more specifically _computer monitor color for the web_, we can cut down on most complexity of other tools and are left with only a subset
of options, which is sadly an untapped space.

So in essence, this library aims to fill the void between those two sides by prioritizing **practicality** and **precision** (as opposed to completeness in the latter side and, uh, I’m not sure what outlines the former side other than fundamental
misunderstandings of color 🤷‍♂️).

### Practicality

This tool is to be task-oriented rather than theory-oriented (or color space-oriented). Use whatever color space or algorithms arguably solve a task better than others. Make it opaque to the user. If a color space is not absolutely necessary to perform any
tasks, don’t support it in this library (which is why HSL isn’t used for any operation¹).

Going further, supporting all browser or web standards are not a priority for this library². The best results are all that matters.

> 1: HSL isn’t used because it’s an outdated colorspace not suitable for any practical application ([more explanation](https://better-color-tools.pages.dev/terminology#hsl)).

> 2: This comment about not prioritizing standards refers to the [upcoming color spaces in CSS](https://www.w3.org/TR/css-color-5/#color-function). There are some curious choices such as
> [using D50 rather than the widely-agreed-upon D65 for the center whitepoint](https://gist.github.com/Myndex/47c793f8a054041bd2b52caa7ad5271c#myth-destruction), which has a huge impact on how colors are displayed, and differs from most other applications
> without a clear reason. Further, the standards merely open more options to implementors, and those options may not necessarily be cutting-edge or the best options available. The need for standard-based tooling is important! But this library is not
> concerned with standards or popularity, only color science. If the best tools available happen to be in the new CSS standards, fantastic. But that would be only a coincidence and not a restriction.

### Precision

Given a particular color space and constraints of a task, this library will be as precise as any other tool available. In a scenario where performance must be sacrificed for precision, precision will always be preferred. After all, while this _can_ run
effectively in a browser, many color operations can also be frontloaded such that they don’t have to happen at runtime (which is always true for the Sass version of this library). Precision should be at least of 16-bit quality (higher than the 8-bit sRGB
standard). The reliability of all color matrices should be sweated; after all, if Better Color Tools isn’t _better_, what’s the point?

### Performance (side-goal)

Though no library prioritizes slowness and this is usually a given, assuming the previous two goals are met, make this library operate as quickly as possible. A great side effect of ignoring most color spaces is performance by default. Comprehensive color
libraries must include bulky data tables for whitepoints and observers and must support a litany of color spaces which makes them impractical to use in any browser unless that application is specifically for color science. This library keeps only what’s
essential for a few tasks, and discards the rest. As a result, the JS version of this library ships very little code to the browser (a few kB gzipped), and can be used clientside without much thought.

Performance is also a nice side effect of only ever dealing with at most 2 color spaces for any given task (the color space used for any calculation + sRGB). As a result, this library will perform the fewest operations between those 2 spaces³.

> 3: CIE XYZ is a common starting point, especially when converting from one color space to another. For libraries concerned with making the most color spaces available, converting to/from XYZ is necessary to achieve the best results. And also because
> trying to optimize every permutation of color space conversion would be overkill/unmanageable. But for Better Color Tools, those direct conversions matter, so XYZ can be skipped. While this is moot for a single conversion, across an entire website at
> scale this can have an impact on developing and building websites, so these micro-optimizations do matter.
