<?php

declare(strict_types=1);

namespace App\Common\Twig\Components;

use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

/**
 * Carte générique : titre + contenu (block content), lien optionnel.
 *
 * Usage : <twig:Card title="..." href="..."> ... </twig:Card>
 */
#[AsTwigComponent]
final class Card
{
    public string $title = '';

    public ?string $href = null;

    public function hasLink(): bool
    {
        return null !== $this->href && '' !== $this->href;
    }
}
