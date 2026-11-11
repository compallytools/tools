<?php

declare(strict_types=1);

namespace App\__MODULE__\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Module __MODULE__ : host __snake__.host (config/modules.yaml), noms __snake___*.
 */
final class __MODULE__Controller extends AbstractController
{
    #[Route('/', name: 'index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('@__MODULE__/index.html.twig');
    }
}
