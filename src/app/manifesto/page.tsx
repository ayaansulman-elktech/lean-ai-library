import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ManifestoPage() {
  return (
    <div className="mx-auto max-w-3xl px-[18px] py-[60px] font-sans text-black min-h-screen">
      <nav className="mb-[60px] text-[14px]">
        <Link href="/" className="inline-flex items-center gap-2 hover:underline transition-colors text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to articles
        </Link>
      </nav>

      <h1 className="mb-20 text-[42px] font-bold leading-[1.1] tracking-tight text-center max-w-2xl mx-auto">
        Manifesto for open<br />research into intelligent<br />architectures.
      </h1>

      <div className="space-y-12 text-[15px] leading-[1.6]">
        <section>
          <h2 className="text-[18px] font-bold mb-3">1. Research should stay open</h2>
          <p className="mb-4">
            Research in artificial intelligence should not be confined to large institutions, major companies, selective conferences, or the usual systems of reputation.
          </p>
          <p className="mb-4">
            New ideas often begin outside established labs. They may come from one person, a small group, an independent project, or an intuition that is still rough around the edges. They still deserve to be written down, tested, challenged, and improved.
          </p>
          <p>The Cognitive Shift Project defends the right to explore freely.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">2. Share first, evaluate next</h2>
          <p className="mb-4">
            An idea should not need permission from a closed system before it can be shared.
          </p>
          <p className="mb-4">
            Sharing and evaluation are different steps. Sharing gives an idea a public form: it can be cited, discussed, criticized, and refined. Evaluation then tests its strength, usefulness, and limits.
          </p>
          <p>
            Research does not become valuable only after a small circle approves it. Validation matters, but it should not become a gate that keeps early work from being seen.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">3. Ideas should have versions</h2>
          <p className="mb-4">
            Research changes over time. A model can be incomplete. A hypothesis can be corrected. An architecture can be rebuilt.
          </p>
          <p className="mb-4">
            This project treats research as an iterative process. A piece of work can have several states, several formulations, and different levels of maturity. A first version may be imperfect and still open an important path.
          </p>
          <p>
            What matters is not only how polished an idea is at the start, but whether it can keep improving.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">4. Criticism should add value</h2>
          <p className="mb-4">Useful criticism is part of the work.</p>
          <p className="mb-4">
            Comments, objections, corrections, reformulations, and outside analysis all belong in serious research. Good criticism does not simply dismiss an idea. It pushes the idea to become clearer, stronger, and more precise.
          </p>
          <p>
            The Cognitive Shift Project supports open review that is argued, traceable, and useful to the work itself.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">5. AI should be understood, not only optimized</h2>
          <p className="mb-4">
            The goal is not just to build systems with higher performance. We also need to understand how an architecture represents, transforms, stabilizes, and uses information.
          </p>
          <p className="mb-4">
            Better scores are useful, but they are not the whole story. The deeper question is structural: perception, memory, abstraction, time, causality, decision-making, and adaptation.
          </p>
          <p>
            A powerful system that remains opaque is still incomplete as a scientific object.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">6. Cognitive architectures are a fundamental research space</h2>
          <p className="mb-4">The future of AI is not only about making models larger.</p>
          <p className="mb-4">
            Progress will also come from better structures: hybrid architectures, temporal representations, organized memory, world models, systems that can reason about their own states, adaptive mechanisms, and formal validation methods.
          </p>
          <p>The Cognitive Shift Project explores this direction.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">7. Formalization makes ideas clearer</h2>
          <p className="mb-4">
            A vague idea can be inspiring, but over time it needs to become something we can work with.
          </p>
          <p className="mb-4">
            This project aims to turn intuitions about artificial intelligence into formal representations: operators, graphs, types, constraints, modules, temporal relations, memory structures, and validation systems.
          </p>
          <p>
            Formalizing an idea does not mean reducing it. It means making it testable, shareable, and easier to improve.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">8. Independence comes with responsibility</h2>
          <p className="mb-4">Being independent does not mean working in isolation or rejecting rigor.</p>
          <p className="mb-4">
            If anything, an independent project has to be especially careful: state its assumptions, acknowledge its limits, document its choices, accept criticism, and separate what is demonstrated from what is plausible, speculative, or experimental.
          </p>
          <p>Freedom in research carries intellectual responsibility.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">9. Knowledge should move</h2>
          <p className="mb-4">Research loses part of its force when it stays locked away.</p>
          <p className="mb-4">
            The Cognitive Shift Project supports open circulation whenever possible: texts, notes, conceptual models, diagrams, hypotheses, architectures, intermediate results, and even paths that did not work out.
          </p>
          <p>
            A shared idea can be criticized. A criticized idea can become stronger. A stronger idea can become useful.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">10. The goal is real progress</h2>
          <p className="mb-4">
            This project is not here to manufacture attention or chase whatever is fashionable this month.
          </p>
          <p className="mb-4">
            Its aim is to contribute, at its own scale, to real progress in cognitive AI research: clearer concepts, more understandable architectures, more adaptive systems, and stronger ways to analyze them.
          </p>
          <p>
            The Cognitive Shift Project exists to explore what artificial intelligence could become when it can represent, remember, reason, adapt, and evolve over time.
          </p>
        </section>
      </div>
    </div>
  );
}
