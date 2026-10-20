import RevealLines from "../effects/RevealLines.jsx";
import Reveal from "../effects/Reveal.jsx";
import "../styles/about.css";

export default function About() {
  return (
    <section className="about-page">
      <div className="container">
        <p className="label">About Off Block</p>
        <RevealLines
          as="h1"
          className="display about-title"
          lines={["A delay predictor", "built by an IBDP student", <>who wants to be a <em>pilot.</em></>]}
        />

        <div className="about-columns">
          <Reveal>
            <h2 className="label">What is Off Block?</h2>
            <p>
              Off Block is a flight delay prediction tool built as an IBDP Computer Science Internal Assessment project.
              It helps passengers check the delay probability of upcoming flights departing from Istanbul Airport (IST).
            </p>
            <h2 className="label about-second">How does it work?</h2>
            <p>
              The system analyzes historical flight data, weather conditions, time of day, and route information to
              estimate the likelihood of a delay for any given flight.
            </p>
          </Reveal>

          <Reveal>
            <h2 className="label">About me</h2>
            <p>
              Hey there! I'm an IBDP student, and I built this website as my Computer Science IA
              project. I really hope you find it useful!
            </p>
            <p>
              I'd love to hear your thoughts, whether it's good feedback, criticism, or suggestions to make it better.
              Feel free to reach out!
            </p>
            <p className="about-contact">
              <a href="mailto:delaldeniz2136@gmail.com">delaldeniz2136@gmail.com</a>
            </p>
          </Reveal>
        </div>

        <p className="display about-thanks">Thank you for <em>visiting.</em></p>
      </div>
    </section>
  );
}
